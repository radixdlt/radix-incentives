import { Assets } from "../../assets/constants";

export const DefiPlaza = {
  xUSDCPool: {
    type: "component",
    poolAddress:
      "pool_rdx1c5z06xda4gjykyhupj4fjszdfhsye7h3mcsgwe5cvuz2vemwn7yjax",
    lpResourceAddress:
      "resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x",
    baseResourceAddress: Assets.Fungible.xUSDC,
    quoteResourceAddress: Assets.Fungible.XRD,
  },
  xUSDTPool: {
    type: "component",
    poolAddress:
      "pool_rdx1c5pvssdmlgjh78anllzszh7alal666ayv8h6at3xmxmmpueqf7at4q",
    lpResourceAddress:
      "resource_rdx1thnmcry6e02x6ja73llm8z6pkrurvrsudgez4ammsp24r0v20rllxt",
    baseResourceAddress: Assets.Fungible.xUSDT,
    quoteResourceAddress: Assets.Fungible.XRD,
  },
} as const;
