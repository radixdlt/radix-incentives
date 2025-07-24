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
import { GetNonFungibleBalanceService } from "../../common/gateway/getNonFungibleBalance";
import { EntityNonFungibleDataService } from "../../common/gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageService } from "../../common/gateway/entityNonFungiblesPage";
import { GetFungibleBalanceService } from "../../common/gateway/getFungibleBalance";
import { EntityFungiblesPageService } from "../../common/gateway/entityFungiblesPage";
import { GetAllValidatorsService } from "../../common/gateway/getAllValidators";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import { GetEntityDetailsService } from "../../common/gateway/getEntityDetails";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { GetWeftFinancePositionsService } from "../../common/dapps/weftFinance/getWeftFinancePositions";
import { GetRootFinancePositionsService } from "../../common/dapps/rootFinance/getRootFinancePositions";
import { GetComponentStateService } from "../../common/gateway/getComponentState";
import { GetKeyValueStoreService } from "../../common/gateway/getKeyValueStore";
import { KeyValueStoreDataService } from "../../common/gateway/keyValueStoreData";
import { KeyValueStoreKeysService } from "../../common/gateway/keyValueStoreKeys";
import { AddVotingPowerToDbService } from "../voting-power/addVotingPowerToDb";
import { GetNftResourceManagersService } from "../../common/gateway/getNftResourceManagers";
import { GetNonFungibleIdsService } from "../../common/gateway/getNonFungibleIds";
import { getDatesBetweenIntervals } from "../../common/helpers/getDatesBetweenIntervals";
import { UnstakingReceiptProcessorService } from "../../common/staking/unstakingReceiptProcessor";
import { CalculateTWAVotingPowerService } from "../voting-power/calculateVotingPowerTWA";

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

  const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getLedgerStateLive = GetLedgerStateService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const entityFungiblesPageServiceLive =
    EntityFungiblesPageService.Default.pipe(
      Layer.provide(gatewayApiClientLive)
    );

  const stateEntityDetailsLive = GetFungibleBalanceService.Default.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const entityNonFungiblesPageServiceLive =
    EntityNonFungiblesPageService.Default.pipe(
      Layer.provide(gatewayApiClientLive)
    );

  const entityNonFungibleDataServiceLive =
    EntityNonFungibleDataService.Default.pipe(
      Layer.provide(gatewayApiClientLive)
    );

  const getNonFungibleIdsServiceLive = GetNonFungibleIdsService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungibleDataServiceLive)
  );

  const getNftResourceManagersServiceLive =
    GetNftResourceManagersService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
      Layer.provide(entityNonFungiblesPageServiceLive),
      Layer.provide(getLedgerStateLive),
      Layer.provide(entityNonFungibleDataServiceLive),
      Layer.provide(getNonFungibleIdsServiceLive)
    );

  const getNonFungibleIdsLive = GetNonFungibleIdsService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungibleDataServiceLive)
  );

  const getNftResourceManagersLive = GetNftResourceManagersService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNonFungibleIdsLive)
  );

  const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
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

  const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getComponentStateServiceLive = GetComponentStateService.Default.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(appConfigServiceLive)
  );

  const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
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

  const calculateTWAVotingPowerLive =
    CalculateTWAVotingPowerService.Default.pipe(Layer.provide(dbClientLive));

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

  const calculateVotingPowerAtStateVersion = (input: {
    startDate: Date;
    endDate: Date;
    accounts: {
      account_address: string;
      selected_option: string;
      rola_proof: {
        curve: string;
        publicKey: string;
        signature: string;
      };
    }[];
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

      yield* Effect.forEach(dates, (date) => {
        return Effect.gen(function* () {
          yield* Effect.log(`getting voting power for ${date.toISOString()}`);
          const result = yield* getVotingPowerAtStateVersion.run({
            addresses: input.accounts.map((account) => account.account_address),
            at_ledger_state: { timestamp: date },
          });

          const votingPower = result.map((item) => ({
            accountAddress: item.address,
            votingPower: item.votingPower.toString(),
            balances: item.balances,
            timestamp: date,
            selectedOption:
              input.accounts.find(
                (account) => account.account_address === item.address
              )?.selected_option ?? "",
            rolaProof: JSON.stringify(
              input.accounts.find(
                (account) => account.account_address === item.address
              )?.rola_proof ?? {}
            ),
          }));
          yield* addVotingPowerToDb.run(votingPower);
        });
      });
    });

    const program = Effect.provide(
      runnable,
      Layer.mergeAll(getVotingPowerAtStateVersionLive, addVotingPowerToDbLive)
    );

    return Effect.runPromiseExit(program);
  };

  const calculateTWAVotingPower = () => {
    const runnable = Effect.gen(function* () {
      const calculateTWAVotingPower = yield* CalculateTWAVotingPowerService;
      return yield* calculateTWAVotingPower.run();
    });

    const program = Effect.provide(
      runnable,
      Layer.mergeAll(calculateTWAVotingPowerLive)
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
    calculateVotingPowerAtStateVersion,
    listConsultations,
    calculateTWAVotingPower,
  };
};
