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
};

const expectedOrigin =
  process.env.VERCEL_ENV === "production"
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : "http://localhost:3000";

export const defaultAppConfig: AppConfig = {
  networkId: 1,
  applicationName: "Radix Incentivization dApp",
  dAppDefinitionAddress:
    "account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k",
  expectedOrigin,
  logLevel: "debug",
  challengeTTL: 1000 * 60 * 5,
  sessionTTL: THIRTY_DAYS,
  sessionRefreshThreshold: FIFTEEN_DAYS,
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

export const createAppConfigLive = (input: AppConfig = defaultAppConfig) =>
  Layer.effect(AppConfigService, Effect.succeed(input));
