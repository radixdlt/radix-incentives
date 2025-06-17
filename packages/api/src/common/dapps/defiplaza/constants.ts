import { Assets } from "../../assets/constants";

export const DefiPlaza = {
	xUSDCPool: {
		type: "component",
		poolAddress: "pool_rdx1c5z06xda4gjykyhupj4fjszdfhsye7h3mcsgwe5cvuz2vemwn7yjax",
		lpResourceAddress: "resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x",
		baseResourceAddress: "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
		quoteResourceAddress: Assets.Fungible.XRD
	},
	xUSDTPool: {
		type: "component",
		poolAddress: "pool_rdx1c5pvssdmlgjh78anllzszh7alal666ayv8h6at3xmxmmpueqf7at4q",
		lpResourceAddress: "resource_rdx1thnmcry6e02x6ja73llm8z6pkrurvrsudgez4ammsp24r0v20rllxt",
		baseResourceAddress: "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",
		quoteResourceAddress: Assets.Fungible.XRD
	}
};

export const defiplazaFungibleRecourceAddresses = new Set<string>(Object.values(DefiPlaza).map(pool => pool.lpResourceAddress));
export const defiplazaFungibleComponentAddressSet = new Set<string>(Object.values(DefiPlaza).map(pool => pool.poolAddress));
