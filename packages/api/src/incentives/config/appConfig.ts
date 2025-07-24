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
  redisHost: string;
  redisPassword: string;
  redisPort: number;
  gatewayApiBaseUrl: string;
  otlpBaseUrl: string;
};

const expectedOrigin =
  process.env.VERCEL_ENV === "production"
    ? "https://radix-incentives-dashboard.vercel.app"
    : process.env.APP_URL
      ? process.env.APP_URL
      : "http://localhost:3000";

export const defaultAppConfig: AppConfig = {
  networkId: 1,
  applicationName: "Radix Incentivization dApp",
  dAppDefinitionAddress:
    "account_rdx129zzrj4mwjwec8e6rmsvcz0hx4lp7uj3kf73w8rd2fek4cryaemewh",
  expectedOrigin,
  logLevel: "debug",
  challengeTTL: 1000 * 60 * 5,
  sessionTTL: THIRTY_DAYS,
  sessionRefreshThreshold: FIFTEEN_DAYS,
  stateVersionKey: "stateVersion",
  redisHost: process.env.REDIS_HOST ?? "localhost",
  redisPassword: process.env.REDIS_PASSWORD ?? "password",
  redisPort: Number.parseInt(process.env.REDIS_PORT ?? "6379"),
  gatewayApiBaseUrl:
    process.env.GATEWAY_URL ?? "https://mainnet-gateway.radixdlt.com",
  otlpBaseUrl: process.env.OTLP_BASE_URL ?? "http://127.0.0.1:4318",
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
