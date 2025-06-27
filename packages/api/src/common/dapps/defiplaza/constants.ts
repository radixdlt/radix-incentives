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
    componentAddress:
      "component_rdx1czmha58h7vw0e4qpxz8ga68cq6h5fjm27w2z43r0n6k9x65nvrjp4g",
  },
  xUSDTPool: {
    type: "component",
    poolAddress:
      "pool_rdx1c5pvssdmlgjh78anllzszh7alal666ayv8h6at3xmxmmpueqf7at4q",
    lpResourceAddress:
      "resource_rdx1thnmcry6e02x6ja73llm8z6pkrurvrsudgez4ammsp24r0v20rllxt",
    baseResourceAddress: Assets.Fungible.xUSDT,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress: "",
  },
  xETHPool: {
    type: "component",
    poolAddress:
      "pool_rdx1ckt7dhmt5gr9vdsgz3p62fm88pm7f69kzzqw2268f3negvgns2xkpa",
    lpResourceAddress:
      "resource_rdx1t5k00sp4jejklp8cx6nw7ecvhz7z07mfexgmdyflgqpflfvzv8v7wd",
    baseResourceAddress: Assets.Fungible.xETH,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      "component_rdx1cr0nw5ppvryyqcv6thkslcltkw5cm3c2lvm2yr8jhh9rqe76stmars",
  },
  xwBTCPool: {
    type: "component",
    poolAddress:
      "pool_rdx1c5xlqz5uc62fzlsyl2f3ql6lx8upc75tdpe4f8cmys83lpqrrul976",
    lpResourceAddress:
      "resource_rdx1t4x7f34hec2jxtay6cvxvcq3skmkg9pwtr98m4dm7qfrvnaddlavgv",
    baseResourceAddress: Assets.Fungible.wxBTC,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      "component_rdx1czzqr5m40x3sklwntcmx8uw3ld5nj7marq66nm6erp3prw7rv8zu29",
  },
} as const;

export const defiPlazaComponentSet = new Map<
  string,
  (typeof DefiPlaza)[keyof typeof DefiPlaza]
>(Object.values(DefiPlaza).map((pool) => [pool.componentAddress, pool]));
