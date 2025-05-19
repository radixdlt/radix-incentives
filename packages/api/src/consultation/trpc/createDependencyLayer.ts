import type { Db } from "db/consultation";
import { type AppConfig, createAppConfigLive } from "../config/appConfig";
import { createDbClientLive } from "../db/dbClient";
import { LoggerLive } from "../../common/logger/logger";
import { Effect, Layer } from "effect";
import { RolaServiceLive } from "../rola/rola";
import {
  CreateChallengeLive,
  createChallengeProgram,
} from "../challenge/createChallenge";
import { VerifyRolaProofLive } from "../rola/verifyRolaProof";
import {
  signInWithRolaProof,
  type SignInWithRolaProofInput,
} from "../programs/signInWithRolaProof";
import { GenerateSessionTokenLive } from "../session/generateSessionToken";
import { CreateSessionLive } from "../session/createSession";
import { VerifyChallengeLive } from "../challenge/verifyChallenge";
import { UpsertUserLive } from "../user/upsertUser";
import { validateSessionTokenProgram } from "../programs/validateSessionToken";
import { InvalidateSessionLive } from "../session/invalidateSession";
import {
  verifyAccountOwnershipProgram,
  type VerifyAccountOwnershipInput,
} from "../programs/verifyAccountOwnership";
import { UpsertAccountsLive } from "../account/upsertAccounts";
import { GetAccountsByAddressLive } from "../account/getAccountsByAddress";
import { GetSessionLive } from "../session/getSession";
import { getAccountsProgram } from "../programs/getAccounts";
import { signOutProgram } from "../programs/signOutProgram";
import {
  type VerifyConsultationSignatureInput,
  verifyConsultationSignatureProgram,
} from "../programs/verifyConsultationSignature";
import { AddConsultationToDbLive } from "../consultation/addConsultationToDb";
import { CreateConsultationMessageLive } from "../consultation/createConsultationMessage";
import { getConsultationsProgram } from "../programs/getConsulations";
import { GetVotingPowerAtStateVersionLive } from "../voting-power/getVotingPowerAtStateVersion";
import { ConvertLsuToXrdLive } from "../../common/staking/convertLsuToXrd";
import { GetLsulpValueLive } from "../../common/dapps/caviarnine/getLsulpValue";
import { GetLsulpLive } from "../../common/dapps/caviarnine/getLsulp";
import { GetUserStakingPositionsLive } from "../../common/staking/getUserStakingPositions";
import { GetNonFungibleBalanceLive } from "../../common/gateway/getNonFungibleBalance";
import { EntityNonFungibleDataLive } from "../../common/gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageLive } from "../../common/gateway/entityNonFungiblesPage";
import { GetFungibleBalanceLive } from "../../common/gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../../common/gateway/entityFungiblesPage";
import { GetAllValidatorsLive } from "../../common/gateway/getAllValidators";
import { GetLedgerStateLive } from "../../common/gateway/getLedgerState";
import { GetEntityDetailsServiceLive } from "../../common/gateway/getEntityDetails";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import {
  getVotingPowerAtStateVersionProgram,
  type GetVotingPowerAtStateVersionProgramInput,
} from "../voting-power/getVotingPowerAtStateVersionProgram";
import { GetWeftFinancePositionsLive } from "../../common/dapps/weftFinance/getWeftFinancePositions";
import { GetRootFinancePositionsLive } from "../../common/dapps/rootFinance/getRootFinancePositions";
import { GetComponentStateLive } from "../../common/gateway/getComponentState";
import { GetKeyValueStoreLive } from "../../common/gateway/getKeyValueStore";
import { KeyValueStoreDataLive } from "../../common/gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../../common/gateway/keyValueStoreKeys";
import { AddVotingPowerToDbLive } from "../voting-power/addVotingPowerToDb";
import { localDbClientLive } from "../voting-power/localDbClientLayer";

export type DependencyLayer = ReturnType<typeof createDependencyLayer>;

export type CreateDependencyLayerInput = {
  dbClient: Db;
  appConfig?: AppConfig;
};

export const createDependencyLayer = (input: CreateDependencyLayerInput) => {
  const dbClientLive = createDbClientLive(input.dbClient);
  const appConfigLive = createAppConfigLive(input.appConfig);

  const loggerLive = LoggerLive.pipe(Layer.provide(appConfigLive));

  const rolaServiceLive = RolaServiceLive.pipe(Layer.provide(appConfigLive));

  const createChallengeLive = CreateChallengeLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertUserLive = UpsertUserLive.pipe(Layer.provide(dbClientLive));

  const generateSessionTokenLive = GenerateSessionTokenLive;

  const verifyChallengeLive = VerifyChallengeLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const createSessionLive = CreateSessionLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const verifyRolaProofLive = VerifyRolaProofLive.pipe(
    Layer.provide(loggerLive),
    Layer.provide(rolaServiceLive)
  );

  const invalidateSessionLive = InvalidateSessionLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertAccountsLive = UpsertAccountsLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getAccountsByAddressLive = GetAccountsByAddressLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getSessionLive = GetSessionLive.pipe(Layer.provide(dbClientLive));

  const addConsultationToDbLive = AddConsultationToDbLive.pipe(
    Layer.provide(dbClientLive)
  );

  const createConsultationMessageLive = CreateConsultationMessageLive;

  const appConfigServiceLive = createAppConfigLive();

  const gatewayApiClientLive = GatewayApiClientLive.pipe(
    Layer.provide(appConfigServiceLive)
  );

  const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(loggerLive)
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
    Layer.provide(loggerLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const entityNonFungibleDataServiceLive = EntityNonFungibleDataLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(loggerLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getUserStakingPositionsLive = GetUserStakingPositionsLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(loggerLive),
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
    Layer.provide(loggerLive),
    Layer.provide(stateEntityDetailsLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getLsulpValueLive = GetLsulpValueLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(loggerLive),
    Layer.provide(stateEntityDetailsLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const convertLsuToXrdLive = ConvertLsuToXrdLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(loggerLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(loggerLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive)
  );

  const getComponentStateServiceLive = GetComponentStateLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(loggerLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(appConfigServiceLive)
  );

  const keyValueStoreDataServiceLive = KeyValueStoreDataLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(loggerLive)
  );

  const keyValueStoreKeysServiceLive = KeyValueStoreKeysLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(loggerLive)
  );

  const getKeyValueStoreServiceLive = GetKeyValueStoreLive.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(loggerLive),
    Layer.provide(keyValueStoreDataServiceLive),
    Layer.provide(keyValueStoreKeysServiceLive)
  );

  const getWeftFinancePositionsLive = GetWeftFinancePositionsLive.pipe(
    Layer.provide(getNonFungibleBalanceLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getComponentStateServiceLive),
    Layer.provide(getKeyValueStoreServiceLive)
  );

  const getRootFinancePositionLive = GetRootFinancePositionsLive.pipe(
    Layer.provide(getNonFungibleBalanceLive),
    Layer.provide(entityNonFungiblesPageServiceLive)
  );

  const getVotingPowerAtStateVersionLive =
    GetVotingPowerAtStateVersionLive.pipe(
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
      Layer.provide(getRootFinancePositionLive)
    );

  const addVotingPowerToDbLive = AddVotingPowerToDbLive.pipe(
    Layer.provide(dbClientLive)
  );

  const createChallenge = () =>
    Effect.runPromiseExit(
      createChallengeProgram.pipe(Effect.provide(createChallengeLive))
    );

  const signIn = (input: SignInWithRolaProofInput) => {
    const program = Effect.provide(
      signInWithRolaProof(input),
      Layer.mergeAll(
        rolaServiceLive,
        loggerLive,
        appConfigLive,
        dbClientLive,
        verifyRolaProofLive,
        createSessionLive,
        generateSessionTokenLive,
        upsertUserLive,
        verifyChallengeLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const validateSessionToken = (sessionToken: string) => {
    const program = Effect.provide(
      validateSessionTokenProgram(sessionToken),
      Layer.mergeAll(
        getSessionLive,
        invalidateSessionLive,
        dbClientLive,
        appConfigLive,
        loggerLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const verifyAccountOwnership = (input: VerifyAccountOwnershipInput) => {
    const program = Effect.provide(
      verifyAccountOwnershipProgram(input),
      Layer.mergeAll(
        rolaServiceLive,
        loggerLive,
        appConfigLive,
        dbClientLive,
        verifyRolaProofLive,
        verifyChallengeLive,
        upsertAccountsLive,
        getAccountsByAddressLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const getAccounts = (userId: string) => {
    const program = Effect.provide(
      getAccountsProgram(userId),
      Layer.mergeAll(dbClientLive)
    );

    return Effect.runPromiseExit(program);
  };

  const signOut = (userId: string) => {
    const program = Effect.provide(
      signOutProgram(userId),
      Layer.mergeAll(dbClientLive)
    );

    return Effect.runPromiseExit(program);
  };

  const verifyConsultationSignature = (
    input: VerifyConsultationSignatureInput
  ) => {
    const program = Effect.provide(
      verifyConsultationSignatureProgram(input),
      Layer.mergeAll(
        dbClientLive,
        createConsultationMessageLive,
        addConsultationToDbLive,
        verifyRolaProofLive,
        loggerLive,
        rolaServiceLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const getConsultations = (userId: string) => {
    const program = Effect.provide(
      getConsultationsProgram(userId),
      Layer.mergeAll(dbClientLive)
    );

    return Effect.runPromiseExit(program);
  };

  const getVotingPowerAtStateVersion = (
    input: GetVotingPowerAtStateVersionProgramInput
  ) => {
    const program = Effect.provide(
      getVotingPowerAtStateVersionProgram(input),
      Layer.mergeAll(
        getVotingPowerAtStateVersionLive,
        gatewayApiClientLive,
        loggerLive,
        stateEntityDetailsLive,
        entityFungiblesPageServiceLive,
        getLedgerStateLive,
        entityNonFungiblesPageServiceLive,
        entityNonFungibleDataServiceLive,
        getNonFungibleBalanceLive,
        getAllValidatorsServiceLive,
        getUserStakingPositionsLive,
        getLsulpLive,
        getLsulpValueLive,
        convertLsuToXrdLive,
        getEntityDetailsServiceLive,
        getWeftFinancePositionsLive,
        getKeyValueStoreServiceLive,
        keyValueStoreDataServiceLive,
        keyValueStoreKeysServiceLive,
        getRootFinancePositionLive,
        addVotingPowerToDbLive,
        dbClientLive,
        localDbClientLive
      )
    );

    return Effect.runPromiseExit(Effect.scoped(program));
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
  };
};
