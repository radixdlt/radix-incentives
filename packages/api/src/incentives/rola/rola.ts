import { Rola, type RolaError, type SignedChallenge } from '@radixdlt/rola';
import { Config, Data, Effect } from 'effect';
import { GatewayApiClientService } from '../../common/gateway';
import { defaultAppConfig } from '../config/appConfig';

class VerifyRolaProofError extends Data.TaggedError('VerifyRolaProofError')<{
  message: string;
  error: RolaError;
}> {}

export class RolaService extends Effect.Service<RolaService>()('RolaService', {
  dependencies: [GatewayApiClientService.Default],
  effect: Effect.gen(function* () {
    const networkId = yield* Config.number('NETWORK_ID').pipe(
      Config.withDefault(defaultAppConfig.networkId),
    );
    const applicationName = yield* Config.string('APPLICATION_NAME').pipe(
      Config.withDefault(defaultAppConfig.applicationName),
    );
    const dAppDefinitionAddress = yield* Config.string(
      'DAPP_DEFINITION_ADDRESS',
    ).pipe(Config.withDefault(defaultAppConfig.dAppDefinitionAddress));
    const expectedOrigin = yield* Config.string('APP_URL').pipe(
      Config.withDefault(defaultAppConfig.expectedOrigin),
    );
    const gatewayApiClient = yield* GatewayApiClientService;

    const { verifySignedChallenge } = Rola({
      networkId,
      applicationName,
      dAppDefinitionAddress,
      expectedOrigin,
      gatewayApiClient: gatewayApiClient.rawClient,
    });

    return Effect.fn(function* (signedChallenge: SignedChallenge) {
      const result = yield* Effect.tryPromise(() =>
        verifySignedChallenge(signedChallenge),
      );

      if (result.isErr()) {
        return yield* Effect.fail(
          new VerifyRolaProofError({
            message: `failed to verify rola proof`,
            error: result.error,
          }),
        );
      }

      return result.value;
    });
  }),
}) {}
