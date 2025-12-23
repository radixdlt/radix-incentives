import { layer } from '@effect/vitest';
import { seasons, userSeasonRewardClaims, users } from 'db/incentives';
import { Array as A, Effect, flow, Logger, Option, Schema } from 'effect';
import {
  Epoch,
  NetworkId,
  Nonce,
  SeasonId,
  TransactionId,
  TransactionManifestString,
  UserId,
} from 'shared/brandedTypes';
import { truncateTables } from '../../test-helpers/truncateTables';
import { AccountAddress, Amount } from '../account-balance/v2/schemas';
import { DbService } from '../db/dbClient';
import {
  Ed25519PublicKeySchema,
  TransactionHeaderSchema,
  TransactionIntentSchema,
} from '../transaction-intent/schemas';
import { SeasonRewardClaim } from './seasonRewardClaim';

const item = {
  transactionId: TransactionId.make(
    'txid_tdx_2_1ykhr8yx3gerj6vcj7t42ljqhedsx3p2lxphnuvg8smzuj9jg82nsvqa3zr',
  ),
  amount: Amount('1'),
  data: {
    header: {
      networkId: NetworkId.make(2),
      startEpochInclusive: Epoch.make(165719),
      endEpochExclusive: Epoch.make(165721),
      nonce: 1702510788,
      notaryIsSignatory: false,
      tipPercentage: 0,
      notaryPublicKey:
        'ff57575dc7af8bfc4d0837cc1ce2017b686a88145dc5579a958e3462fe9a908e',
    },
    message: undefined,
    manifest: TransactionManifestString.make(
      '\n                    \n              CALL_METHOD\n                Address("accesscontroller_tdx_2_1cvks8klac94cpghwhp9jem7f9psvve3ve2x4z85adkpsc5r6everm2")\n                "create_proof"\n              ;\n\n              CALL_METHOD\n                Address("account_tdx_2_1cyxg7gq8y0s3gsnj43xfyw7cp9ag5hmlgzhu0fgw6dexc9qyz0uhgs")\n                "lock_fee"\n                Decimal("100")\n              ;\n            \n                    \n              CALL_METHOD\n                Address("account_tdx_2_1cyxg7gq8y0s3gsnj43xfyw7cp9ag5hmlgzhu0fgw6dexc9qyz0uhgs")\n                "create_proof_of_amount"\n                Address("resource_tdx_2_1tkrrtnrk349lj27vleltzvquvseqr2phhd5l72wwq7ww2saxvdknrf")\n                Decimal("1")\n              ;\n\n              CALL_METHOD\n                Address("component_tdx_2_1cp80y8e4tsje62d9a89sesqk4ppvxkmawyr9dh6avc95njm2cavpx7")\n                "claim"\n                Decimal("1")\n                Address("account_tdx_2_12xcphs3q2xd7kkrfmsmxmumxpv5p6ecy42jpywxj0ntkngxl5skqxf")\n              ;\n                  ',
    ),
  },
  accountAddress: AccountAddress(
    'account_tdx_2_12xcphs3q2xd7kkrfmsmxmumxpv5p6ecy42jpywxj0ntkngxl5skqxf',
  ),
};

const TestSetup = Effect.gen(function* () {
  const db = yield* DbService;

  const _notaryPublicKey = yield* Schema.decode(Ed25519PublicKeySchema)(
    'ff57575dc7af8bfc4d0837cc1ce2017b686a88145dc5579a958e3462fe9a908e',
  );

  const _header = yield* Schema.decode(TransactionHeaderSchema)({
    networkId: NetworkId.make(2),
    startEpochInclusive: Epoch.make(165719),
    endEpochExclusive: Epoch.make(165721),
    notaryPublicKey:
      'ff57575dc7af8bfc4d0837cc1ce2017b686a88145dc5579a958e3462fe9a908e',
    nonce: Nonce.make(1702510788),
    notaryIsSignatory: false,
    tipPercentage: 0,
  });

  const _transactionIntent = yield* Schema.decode(TransactionIntentSchema)(
    item.data,
  );

  return yield* db.use(async (db) => {
    const [season] = await db
      .insert(seasons)
      .values({
        name: 'Season 1',
        status: 'active',
      })
      .returning();

    const [user] = await db
      .insert(users)
      .values({
        identityAddress: crypto.randomUUID(),
        label: 'Test User',
      })
      .returning();

    await db
      .insert(userSeasonRewardClaims)
      .values({ ...item, userId: user.id, seasonId: season.id });

    return {
      seasonId: SeasonId.make(season.id),
      userId: UserId.make(user.id),
    };
  });
}).pipe(Effect.provide(DbService.Default));

layer(SeasonRewardClaim.Default)('SeasonRewardClaim', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });
  it.effect('should decode a pending transaction', () =>
    Effect.gen(function* () {
      const seasonRewardClaim = yield* SeasonRewardClaim;

      const { userId, seasonId } = yield* TestSetup;

      const result = yield* seasonRewardClaim
        .getUnresolved({
          userId,
          seasonId,
        })
        .pipe(Effect.map(flow(A.head, Option.getOrThrow)));

      expect(result).toHaveProperty('transactionId', item.transactionId);
      expect(result).toHaveProperty('amount', Amount('1.000000'));
      expect(result).toHaveProperty('transactionIntent');
      expect(result).toHaveProperty('accountAddress', item.accountAddress);
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('seasonId', seasonId);
      expect(result).toHaveProperty('status', 'pending');
    }).pipe(Effect.provide(Logger.pretty)),
  );
});
