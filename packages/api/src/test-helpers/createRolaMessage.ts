import { Config, Effect } from 'effect';
import { createRolaMessage as createRolaMessageFromRadixConnect } from 'radix-connect';
import { defaultAppConfig } from '../incentives/config';

export const createRolaMessage = (challenge: string) =>
  Effect.gen(function* () {
    const dAppDefinitionAddress = yield* Config.string(
      'DAPP_DEFINITION_ADDRESS',
    ).pipe(Config.withDefault(defaultAppConfig.dAppDefinitionAddress));

    const expectedOrigin = yield* Config.string('APP_URL').pipe(
      Config.withDefault(defaultAppConfig.expectedOrigin),
    );

    return createRolaMessageFromRadixConnect({
      dAppDefinitionAddress,
      origin: expectedOrigin,
      challenge,
    });
  });
