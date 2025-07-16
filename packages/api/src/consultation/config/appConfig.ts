import { Context, Effect, Layer } from "effect";

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
const FIFTEEN_DAYS = 1000 * 60 * 60 * 24 * 15;

export type AppConfig = {
  networkId: number;
  applicationName: string;
  dAppDefinitionAddress: string;
  expectedOrigin: string;
  logLevel: "debug" | "info" | "warn" | "error";
  challengeTTL: number;
  sessionTTL: number;
  sessionRefreshThreshold: number;
  stateVersionKey: string;
  redisUrl: string;
  redisPassword: string;
  redisPort: number;
  gatewayApiBaseUrl: string;
};

const expectedOrigin =
  process.env.VERCEL_ENV === "production"
    ? "https://consultation.radixdlt.com"
    : process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : "http://localhost:3002";

export const defaultAppConfig: AppConfig = {
  networkId: 1,
  applicationName: "Radix Consultation dApp",
  dAppDefinitionAddress:
    "account_rdx129xqyvgkn9h73atyrzndal004fwye3tzw49kkygv9ltm2kyrv2lmda",
  expectedOrigin,
  logLevel: "debug",
  challengeTTL: 1000 * 60 * 5,
  sessionTTL: THIRTY_DAYS,
  sessionRefreshThreshold: FIFTEEN_DAYS,
  stateVersionKey: "streamerStateVersion",
  redisUrl: "localhost",
  redisPassword: "password",
  redisPort: 6379,
  gatewayApiBaseUrl:
    process.env.GATEWAY_URL ?? "https://mainnet-gateway.radixdlt.com",
};

export type CreateAppConfigInput = Partial<AppConfig>;

export const createConfig = (input: CreateAppConfigInput = {}) => {
  const config = { ...defaultAppConfig, ...input };
  return config;
};

export class AppConfigService extends Context.Tag("AppConfigService")<
  AppConfigService,
  AppConfig
>() {}

export const createAppConfigLive = (input: AppConfig = defaultAppConfig) => {
  return Layer.effect(AppConfigService, Effect.succeed({ ...input }));
};

console.log("rolaConfig", {
  expectedOrigin: defaultAppConfig.expectedOrigin,
  dAppDefinitionAddress: defaultAppConfig.dAppDefinitionAddress,
  networkId: defaultAppConfig.networkId,
});
