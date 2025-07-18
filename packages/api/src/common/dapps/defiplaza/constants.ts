import { Assets } from "../../assets/constants";

export const DefiPlaza = {
  xUSDCPool: {
    type: "component",
    basePoolAddress:
      "pool_rdx1c5z06xda4gjykyhupj4fjszdfhsye7h3mcsgwe5cvuz2vemwn7yjax",
    baseLpResourceAddress:
      "resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x",
    quotePoolAddress:
      "pool_rdx1ch62axcl22gnmhe5ajtwraukrxstxxqlq5c6p9n2y5qv0pgyqnhfry",
    quoteLpResourceAddress:
      "resource_rdx1t5gr3wsf7jq28fvnpyfg4rwfkewynv67nnqjna9h5f7mwjuwcwegcj",
    baseResourceAddress: Assets.Fungible.xUSDC,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      "component_rdx1czmha58h7vw0e4qpxz8ga68cq6h5fjm27w2z43r0n6k9x65nvrjp4g",
  },
  xUSDTPool: {
    type: "component",
    basePoolAddress:
      "pool_rdx1c5pvssdmlgjh78anllzszh7alal666ayv8h6at3xmxmmpueqf7at4q",
    baseLpResourceAddress:
      "resource_rdx1thnmcry6e02x6ja73llm8z6pkrurvrsudgez4ammsp24r0v20rllxt",
    quotePoolAddress:
      "pool_rdx1c4scl7k67czs4e29skz0njvcmx4epmrjk4nkrkvsmt93rug7jcnagf",
    quoteLpResourceAddress:
      "resource_rdx1t5swt0y0u6sdzycg02flamm3e6qljjgvpxeg5p5tw6jl7ssel0x369",
    baseResourceAddress: Assets.Fungible.xUSDT,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress: "",
  },
  xETHPool: {
    type: "component",
    basePoolAddress:
      "pool_rdx1ckt7dhmt5gr9vdsgz3p62fm88pm7f69kzzqw2268f3negvgns2xkpa",
    baseLpResourceAddress:
      "resource_rdx1t5k00sp4jejklp8cx6nw7ecvhz7z07mfexgmdyflgqpflfvzv8v7wd",
    quotePoolAddress:
      "pool_rdx1c5glrayedmn0utd44pqs8a3x52dw9aklq2g5f9ewxjxtm7xvjmussa",
    quoteLpResourceAddress:
      "resource_rdx1thhth6tseavhurrgae898k9sht29f3yckzr6szct6zgheqdhxkus0t",
    baseResourceAddress: Assets.Fungible.xETH,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      "component_rdx1cr0nw5ppvryyqcv6thkslcltkw5cm3c2lvm2yr8jhh9rqe76stmars",
  },
  xwBTCPool: {
    type: "component",
    basePoolAddress:
      "pool_rdx1c5xlqz5uc62fzlsyl2f3ql6lx8upc75tdpe4f8cmys83lpqrrul976",
    baseLpResourceAddress:
      "resource_rdx1t4x7f34hec2jxtay6cvxvcq3skmkg9pwtr98m4dm7qfrvnaddlavgv",
    quotePoolAddress:
      "pool_rdx1cht7hqhcnj2la96cygema5l32xwz26luunr9umlszy3s9gr78ppdzv",
    quoteLpResourceAddress:
      "resource_rdx1th6ftl6twglqfz2s8ref2vr5nfccaeq2878p4996uq5duszkjhp2gl",
    baseResourceAddress: Assets.Fungible.wxBTC,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      "component_rdx1czzqr5m40x3sklwntcmx8uw3ld5nj7marq66nm6erp3prw7rv8zu29",
  },
  ASTRLPool: {
    type: "component",
    basePoolAddress:
      "pool_rdx1c47jlmd9stptfy2a7e39wnjfechu72q9ggus29x0mqf98m8xt70rx2",
    baseLpResourceAddress:
      "resource_rdx1t5q26nr5t02pzf40tp9z999ex7d84szldnpqg8e459jyvztrxhqqls",
    quotePoolAddress:
      "pool_rdx1c4xm5wfm92vh39dzszzv3huvdmvz73juhkw8vls0z4fg2vfr0wkv93",
    quoteLpResourceAddress:
      "resource_rdx1tkuuhphx2rtdytucgt0ucnd4k8zymxdeta4xa2req93yuaup3s244u",
    baseResourceAddress: Assets.Fungible.ASTRL,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      "component_rdx1cqvxkaazmpnvg3f9ufc5n2msv6x7ztjdusdm06lhtf5n7wr8guggg5", //make sure this is PlazaPair component, not Dex
  },
  XRDPool: {
    type: "component",
    basePoolAddress:
      "pool_rdx1chxn0nqj840r78t2ah5agchq4ue9p65q23nc9ckqfe0mmjstq8fyg0",
    baseLpResourceAddress:
      "resource_rdx1tknxlx2sy23qkg6twvnu3kqcd5l4daacq0n6mdam54upqgx50f4ju8",
    quotePoolAddress:
      "pool_rdx1c4547fnprjhlp2m27aycmf8rzrkrfzcck58jt2706r85gpcaeapz7k",
    quoteLpResourceAddress:
      "resource_rdx1t4a5clnxmnctmezaty08cuugfzmj2lezqcjk2szezrfdfl4w4ederu",
    baseResourceAddress: Assets.Fungible.XRD,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      "component_rdx1cppd8rq7gfwad75z56mz9tldqmw4aps48hqnx2stf4eeew8v6tyd72",
  },
} as const;

export const defiPlazaComponentSet = new Map<
  string,
  (typeof DefiPlaza)[keyof typeof DefiPlaza]
>(Object.values(DefiPlaza).map((pool) => [pool.componentAddress, pool]));
