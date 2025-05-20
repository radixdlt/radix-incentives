import { Assets } from "../../assets/constants";
import { CaviarNineConstants } from "../caviarnine/constants";

export const WeftFinance = {
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
      packageAddress:
        "package_rdx1pktdrmwan4mcugates06wwcvspn4y0hsapm9zkyg4clh0sf8qn7c6t",
    },
  },
} as const;

export const weftFungibleRecourceAddresses = new Map<string, string>([
  [WeftFinance.v1.wXRD.resourceAddress, Assets.Fungible.XRD],
  [WeftFinance.v1.wxUSDC.resourceAddress, Assets.Fungible.xUSDC],
  [
    WeftFinance.v1.wLSULP.resourceAddress,
    CaviarNineConstants.LSULP.resourceAddress,
  ],
  [WeftFinance.v2.w2XRD.resourceAddress, Assets.Fungible.XRD],
  [WeftFinance.v2.w2xUSDC.resourceAddress, Assets.Fungible.xUSDC],
  [WeftFinance.v2.w2xUSDT.resourceAddress, Assets.Fungible.xUSDT],
  [WeftFinance.v2.w2xwBTC.resourceAddress, Assets.Fungible.wxBTC],
  [WeftFinance.v2.w2wETH.resourceAddress, Assets.Fungible.xETH],
]);

export const weftFungibleComponentAddressSet = new Set<string>([
  WeftFinance.v1.wXRD.componentAddress,
  WeftFinance.v1.wxUSDC.componentAddress,
  WeftFinance.v1.wLSULP.componentAddress,
  WeftFinance.v1.Wefty.componentAddress,
  WeftFinance.v2.lendingPool.componentAddress,
  WeftFinance.v2.WeftyV2.componentAddress,
]);
