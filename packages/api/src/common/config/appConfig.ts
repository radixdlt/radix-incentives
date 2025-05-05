import { Context, Effect, Layer } from "effect";

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
const FIFTEEN_DAYS = 1000 * 60 * 60 * 24 * 15;

const expectedOrigin =
  process.env.VERCEL_ENV === "production"
    ? "https://radix-incentives-dashboard.vercel.app"
    : process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : "http://localhost:3002";

export type AppConfig = typeof defaultAppConfig;

export const KNOWN_RESOURCE_ADDRESSES = {
  xrd: "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
  wxBTC: "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
  xUSDC: "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
  xETH: "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww",
  xUSDT: "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",
  LSULP: "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
} as const;

export const dAppAddresses = {
  weftFinance: {
    v1: {
      wXRD: {
        type: "fungible",
        componentAddress:
          "component_rdx1cq8mm5z49x6lyet44a0jd7zq52flrmykwwxszq65uzfn6pk3mvm0k4",
        resourceAddress:
          "resource_rdx1th2hexq3yrz8sj0nn3033gajnj7ztl0erp4nn9mcl5rj9au75tum0u",
      },
      wxUSDC: {
        type: "fungible",
        componentAddress:
          "component_rdx1cq7qd9vnmmu5sjlnarye09rwep2fhnq9ghj6eafj6tj08y7358z5pu",
        resourceAddress:
          "resource_rdx1tk7kstht8turpzcagqyd4qmzc0gshmm6h0m5cw0rzr8q52t99yxrfn",
      },
      wLSULP: {
        type: "fungible",
        componentAddress:
          "component_rdx1cr5cnuzre63whe4yhnemeyvjj2yaq7tqg0j6q4xxtcyajf8rv0hw26",
        resourceAddress:
          "resource_rdx1tk9xrt4jxsavkmqp8e4xc9u2vwk3n672n4jzmvxrrujhts5sr4e67q",
      },
      Wefty: {
        type: "nonFungible",
        componentAddress:
          "component_rdx1cpuzsp2aqkjzg504s8h8hxg57wnaqpcp9r802jjcly5x3j5nape40l",
        resourceAddress:
          "resource_rdx1nt07uy2jv3g6jwl8knupsjw39wp6a3a522pxs62x7t5j9vmx70rr05",
      },
    },
    v2: {
      lendingPool: {
        type: "component",
        componentAddress:
          "component_rdx1czmr02yl4da709ceftnm9dnmag7rthu0tu78wmtsn5us9j02d9d0xn",
        kvsAddress:
          "internal_keyvaluestore_rdx1kzjr763caq96j0kv883vy8gnf3jvrrp7dfm9zr5n0akryvzsxvyujc",
      },
      w2XRD: {
        type: "fungible",
        resourceAddress:
          "resource_rdx1th0gjs665xgm343j4jee7k8apu8l8pg9cf8x587qprszeeknu8wsxz",
      },
      w2xUSDC: {
        type: "fungible",
        resourceAddress:
          "resource_rdx1thw2u4uss739j8cqumehgf5wyw26chcfu98newsu42zhln7wd050ee",
      },
      w2xUSDT: {
        type: "fungible",
        resourceAddress:
          "resource_rdx1t5ljp8amkf76mrn5txmmemkrmjwt5r0ajjnljvyunh27gm0n295dfn",
      },
      w2xwBTC: {
        type: "fungible",
        resourceAddress:
          "resource_rdx1thyes252jplxhu8qvfx6k3wkmlhy2f09nfqqefuj2a73l79e0af99t",
      },
      w2wETH: {
        type: "fungible",
        resourceAddress:
          "resource_rdx1t456hgpk6kwn4lqut5p2mqqmuuwngzhwxlgyyk9dwv4t5hmp37d7xf",
      },
      WeftyV2: {
        type: "nonFungible",
        resourceAddress:
          "resource_rdx1nt22yfvhuuhxww7jnnml5ec3yt5pkxh0qlghm6f0hz46z2wfk80s9r",
        componentAddress:
          "component_rdx1cpy6putj5p7937clqgcgutza7k53zpha039n9u5hkk0ahh4stdmq4w",
      },
    },
  },
} as const;

export const defaultAppConfig = {
  networkId: 1,
  applicationName: "Radix Incentivization dApp",
  dAppDefinitionAddress:
    "account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k",
  expectedOrigin,
  logLevel: "debug",
  challengeTTL: 1000 * 60 * 5,
  sessionTTL: THIRTY_DAYS,
  sessionRefreshThreshold: FIFTEEN_DAYS,
  stateVersionKey: "stateVersion",
  redisUrl: "redis://localhost:6379",
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
