import type { Db } from "db/consultation";
import { type AppConfig, createAppConfigLive } from "../config/appConfig";
import { createDbClientLive } from "../db/dbClient";
import { Effect, Layer } from "effect";
import { RolaService } from "../rola/rola";
import {
  CreateChallengeLive,
  createChallengeProgram,
} from "../challenge/createChallenge";
import { VerifyRolaProofService } from "../rola/verifyRolaProof";
import {
  SignInWithRolaProofService,
  type SignInWithRolaProofInput,
} from "../auth/signInWithRolaProof";
import { GenerateSessionTokenService } from "../session/generateSessionToken";
import { CreateSessionService } from "../session/createSession";
import { VerifyChallengeService } from "../challenge/verifyChallenge";
import { UpsertUserService } from "../user/upsertUser";
import { ValidateSessionTokenService } from "../auth/validateSessionToken";
import { InvalidateSessionService } from "../session/invalidateSession";
import {
  VerifyAccountOwnershipService,
  type VerifyAccountOwnershipInput,
} from "../account/verifyAccountOwnership";
import { UpsertAccountsService } from "../account/upsertAccounts";
import { GetAccountsByAddressService } from "../account/getAccountsByAddress";
import { GetSessionService } from "../session/getSession";
import { getAccountsProgram } from "../account/getAccounts";
import { signOutProgram } from "../auth/signOutProgram";
import {
  type VerifyConsultationSignatureInput,
  VerifyConsultationSignatureService,
} from "../consultation/verifyConsultationSignature";
import { AddConsultationToDbService } from "../consultation/addConsultationToDb";
import { CreateConsultationMessageService } from "../consultation/createConsultationMessage";
import { GetConsultationsService } from "../consultation/getConsulations";
import { GetVotingPowerAtStateVersionService } from "../voting-power/getVotingPowerAtStateVersion";
import { ConvertLsuToXrdLive } from "../../common/staking/convertLsuToXrd";
import { GetLsulpValueLive } from "../../common/dapps/caviarnine/getLsulpValue";
import { GetLsulpLive } from "../../common/dapps/caviarnine/getLsulp";
import { GetUserStakingPositionsLive } from "../../common/staking/getUserStakingPositions";
import { GetNonFungibleBalanceLive } from "../../common/gateway/getNonFungibleBalance";
import { EntityNonFungibleDataService } from "../../common/gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageLive } from "../../common/gateway/entityNonFungiblesPage";
import { GetFungibleBalanceLive } from "../../common/gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../../common/gateway/entityFungiblesPage";
import { GetAllValidatorsLive } from "../../common/gateway/getAllValidators";
import { GetLedgerStateLive } from "../../common/gateway/getLedgerState";
import { GetEntityDetailsServiceLive } from "../../common/gateway/getEntityDetails";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { GetWeftFinancePositionsService } from "../../common/dapps/weftFinance/getWeftFinancePositions";
import { GetRootFinancePositionsService } from "../../common/dapps/rootFinance/getRootFinancePositions";
import { GetComponentStateLive } from "../../common/gateway/getComponentState";
import { GetKeyValueStoreService } from "../../common/gateway/getKeyValueStore";
import { KeyValueStoreDataLive } from "../../common/gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../../common/gateway/keyValueStoreKeys";
import { AddVotingPowerToDbService } from "../voting-power/addVotingPowerToDb";
import { GetNftResourceManagersLive } from "../../common/gateway/getNftResourceManagers";
import { GetNonFungibleIdsLive } from "../../common/gateway/getNonFungibleIds";
import { getDatesBetweenIntervals } from "../../common/helpers/getDatesBetweenIntervals";
import { UnstakingReceiptProcessorService } from "../../common/staking/unstakingReceiptProcessor";

export type DependencyLayer = ReturnType<typeof createDependencyLayer>;

export type CreateDependencyLayerInput = {
  dbClient: Db;
  appConfig?: AppConfig;
};

export const createDependencyLayer = (input: CreateDependencyLayerInput) => {
  const dbClientLive = createDbClientLive(input.dbClient);
  const appConfigLive = createAppConfigLive(input.appConfig);

  const rolaServiceLive = RolaService.Default.pipe(
    Layer.provide(appConfigLive)
  );

  const createChallengeLive = CreateChallengeLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertUserLive = UpsertUserService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const generateSessionTokenLive = GenerateSessionTokenService.Default;

  const verifyChallengeLive = VerifyChallengeService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const createSessionLive = CreateSessionService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const verifyRolaProofLive = VerifyRolaProofService.Default.pipe(
    Layer.provide(rolaServiceLive)
  );

  const invalidateSessionLive = InvalidateSessionService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertAccountsLive = UpsertAccountsService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const getAccountsByAddressLive = GetAccountsByAddressService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const getSessionLive = GetSessionService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const addConsultationToDbLive = AddConsultationToDbService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const createConsultationMessageLive =
    CreateConsultationMessageService.Default;

  const appConfigServiceLive = createAppConfigLive();

  const gatewayApiClientLive = GatewayApiClientLive.pipe(
    Layer.provide(appConfigServiceLive)
  );

  const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getLedgerStateLive = GetLedgerStateLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getAllValidatorsServiceLive = GetAllValidatorsLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const stateEntityDetailsLive = GetFungibleBalanceLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const entityNonFungibleDataServiceLive =
    EntityNonFungibleDataService.Default.pipe(
      Layer.provide(gatewayApiClientLive)
    );

  const getNonFungibleIdsServiceLive = GetNonFungibleIdsLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungibleDataServiceLive)
  );

  const getNftResourceManagersServiceLive = GetNftResourceManagersLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNonFungibleIdsServiceLive)
  );

  const getNonFungibleIdsLive = GetNonFungibleIdsLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungibleDataServiceLive)
  );

  const getNftResourceManagersLive = GetNftResourceManagersLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNonFungibleIdsLive)
  );

  const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(getNftResourceManagersServiceLive),
    Layer.provide(getNftResourceManagersLive)
  );

  const getUserStakingPositionsLive = GetUserStakingPositionsLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(stateEntityDetailsLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNonFungibleBalanceLive),
    Layer.provide(getAllValidatorsServiceLive)
  );

  const getLsulpLive = GetLsulpLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(stateEntityDetailsLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getLsulpValueLive = GetLsulpValueLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(stateEntityDetailsLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const convertLsuToXrdLive = ConvertLsuToXrdLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getComponentStateServiceLive = GetComponentStateLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(appConfigServiceLive)
  );

  const keyValueStoreDataServiceLive = KeyValueStoreDataLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const keyValueStoreKeysServiceLive = KeyValueStoreKeysLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(keyValueStoreDataServiceLive),
    Layer.provide(keyValueStoreKeysServiceLive)
  );

  const entityNonFungibleDataLive = EntityNonFungibleDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const unstakingReceiptProcessorService =
    UnstakingReceiptProcessorService.Default.pipe(
      Layer.provide(entityNonFungibleDataLive)
    );

  const getWeftFinancePositionsLive =
    GetWeftFinancePositionsService.Default.pipe(
      Layer.provide(getNonFungibleBalanceLive),
      Layer.provide(entityNonFungiblesPageServiceLive),
      Layer.provide(entityFungiblesPageServiceLive),
      Layer.provide(getEntityDetailsServiceLive),
      Layer.provide(getFungibleBalanceLive),
      Layer.provide(getComponentStateServiceLive),
      Layer.provide(getKeyValueStoreServiceLive),
      Layer.provide(unstakingReceiptProcessorService)
    );

  const getRootFinancePositionLive =
    GetRootFinancePositionsService.Default.pipe(
      Layer.provide(getNonFungibleBalanceLive),
      Layer.provide(entityNonFungiblesPageServiceLive),
      Layer.provide(unstakingReceiptProcessorService),
      Layer.provide(getKeyValueStoreServiceLive)
    );

  const getVotingPowerAtStateVersionLive =
    GetVotingPowerAtStateVersionService.Default.pipe(
      Layer.provide(stateEntityDetailsLive),
      Layer.provide(entityFungiblesPageServiceLive),
      Layer.provide(getLedgerStateLive),
      Layer.provide(entityNonFungiblesPageServiceLive),
      Layer.provide(entityNonFungibleDataServiceLive),
      Layer.provide(getNonFungibleBalanceLive),
      Layer.provide(getAllValidatorsServiceLive),
      Layer.provide(getUserStakingPositionsLive),
      Layer.provide(getLsulpLive),
      Layer.provide(getLsulpValueLive),
      Layer.provide(convertLsuToXrdLive),
      Layer.provide(getLsulpValueLive),
      Layer.provide(getEntityDetailsServiceLive),
      Layer.provide(getWeftFinancePositionsLive),
      Layer.provide(getRootFinancePositionLive),
      Layer.provide(getKeyValueStoreServiceLive),
      Layer.provide(unstakingReceiptProcessorService)
    );

  const addVotingPowerToDbLive = AddVotingPowerToDbService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const createChallenge = () =>
    Effect.runPromiseExit(
      createChallengeProgram.pipe(Effect.provide(createChallengeLive))
    );

  const signInWithRolaProofLive = SignInWithRolaProofService.Default.pipe(
    Layer.provide(createSessionLive),
    Layer.provide(generateSessionTokenLive),
    Layer.provide(verifyRolaProofLive),
    Layer.provide(upsertUserLive),
    Layer.provide(verifyChallengeLive)
  );

  const signIn = (input: SignInWithRolaProofInput) => {
    const runnable = Effect.gen(function* () {
      const signInWithRolaProof = yield* SignInWithRolaProofService;
      return yield* signInWithRolaProof.run(input);
    });

    const program = Effect.provide(runnable, signInWithRolaProofLive);

    return Effect.runPromiseExit(program);
  };

  const validateSessionTokenLive = ValidateSessionTokenService.Default.pipe(
    Layer.provide(getSessionLive),
    Layer.provide(invalidateSessionLive),
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const validateSessionToken = (sessionToken: string) => {
    const runnable = Effect.gen(function* () {
      const validateSessionToken = yield* ValidateSessionTokenService;
      return yield* validateSessionToken.run(sessionToken);
    });

    const program = Effect.provide(runnable, validateSessionTokenLive);

    return Effect.runPromiseExit(program);
  };

  const verifyAccountOwnershipLive = VerifyAccountOwnershipService.Default.pipe(
    Layer.provide(verifyChallengeLive),
    Layer.provide(verifyRolaProofLive),
    Layer.provide(upsertAccountsLive),
    Layer.provide(getAccountsByAddressLive)
  );

  const verifyAccountOwnership = (input: VerifyAccountOwnershipInput) => {
    const runnable = Effect.gen(function* () {
      const verifyAccountOwnership = yield* VerifyAccountOwnershipService;
      return yield* verifyAccountOwnership.run(input);
    });

    const program = Effect.provide(runnable, verifyAccountOwnershipLive);

    return Effect.runPromiseExit(program);
  };

  const getAccounts = (userId: string) => {
    const program = Effect.provide(getAccountsProgram(userId), dbClientLive);

    return Effect.runPromiseExit(program);
  };

  const signOut = (userId: string) => {
    const program = Effect.provide(signOutProgram(userId), dbClientLive);

    return Effect.runPromiseExit(program);
  };

  const verifyConsultationSignatureLive =
    VerifyConsultationSignatureService.Default.pipe(
      Layer.provide(createConsultationMessageLive),
      Layer.provide(rolaServiceLive),
      Layer.provide(verifyRolaProofLive),
      Layer.provide(addConsultationToDbLive)
    );

  const verifyConsultationSignature = (
    input: VerifyConsultationSignatureInput
  ) => {
    const runnable = Effect.gen(function* () {
      const verifyConsultationSignature =
        yield* VerifyConsultationSignatureService;
      yield* verifyConsultationSignature.run(input);
    });

    const program = Effect.provide(runnable, verifyConsultationSignatureLive);

    return Effect.runPromiseExit(program);
  };

  const getConsultations = (userId: string) => {
    const runnable = Effect.gen(function* () {
      const getConsultations = yield* GetConsultationsService;
      return yield* getConsultations.run(userId);
    });

    const program = Effect.provide(
      runnable,
      GetConsultationsService.Default.pipe(Layer.provide(dbClientLive))
    );

    return Effect.runPromiseExit(program);
  };

  const getVotingPowerAtStateVersion = (input: {
    startDate: Date;
    endDate: Date;
    addresses: string[];
  }) => {
    const runnable = Effect.gen(function* () {
      const getVotingPowerAtStateVersion =
        yield* GetVotingPowerAtStateVersionService;

      const addVotingPowerToDb = yield* AddVotingPowerToDbService;

      const dates = getDatesBetweenIntervals(
        input.startDate,
        input.endDate,
        (date) => {
          date.setHours(date.getHours() + 1);
        }
      );

      const votingPower = yield* Effect.forEach(dates, (date) => {
        return Effect.gen(function* () {
          yield* Effect.log(`getting voting power for ${date.toISOString()}`);
          const result = yield* getVotingPowerAtStateVersion.run({
            addresses: input.addresses,
            at_ledger_state: { timestamp: date },
          });

          return result.map((item) => ({
            accountAddress: item.address,
            votingPower: item.votingPower.toString(),
            balances: item.balances,
            timestamp: date,
          }));
        });
      });

      yield* addVotingPowerToDb.run(votingPower.flat());
    });

    const program = Effect.provide(
      runnable,
      Layer.mergeAll(getVotingPowerAtStateVersionLive, addVotingPowerToDbLive)
    );

    return Effect.runPromiseExit(program);
  };

  const listConsultations = () => {
    const runnable = Effect.gen(function* () {
      const listConsultations = yield* GetConsultationsService;
      return yield* listConsultations.listConsultations();
    });

    const program = Effect.provide(
      runnable,
      GetConsultationsService.Default.pipe(Layer.provide(dbClientLive))
    );

    return Effect.runPromiseExit(program);
  };

  return {
    createChallenge,
    signIn,
    validateSessionToken,
    verifyAccountOwnership,
    getAccounts,
    signOut,
    verifyConsultationSignature,
    getConsultations,
    getVotingPowerAtStateVersion,
    listConsultations,
  };
};
