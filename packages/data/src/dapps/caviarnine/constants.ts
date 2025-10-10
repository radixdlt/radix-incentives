import { Assets } from '../../assets';

export type ShapeLiquidityPool =
  (typeof CaviarNineConstants.shapeLiquidityPools)[keyof typeof CaviarNineConstants.shapeLiquidityPools];

export type SimplePool =
  (typeof CaviarNineConstants.simplePools)[keyof typeof CaviarNineConstants.simplePools];

export const CaviarNineConstants = {
  LSULP: {
    componentAddress:
      'component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp',
    resourceAddress: Assets.Fungible.LSULP,
    token: Assets.Fungible.LSULP,
  },
  HLP: {
    resourceAddress: Assets.Fungible.HLP,
    poolAddress:
      'pool_rdx1chmckjpr0ks5lk6h7mqvmrw56wt4w6tsuy6n2jhd8fhr8vc5en5e90',
    componentAddress:
      'component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf', //don't need to derive user's value, but important to check for SwapEvents!
    token_x: Assets.Fungible.LSULP,
    token_y: Assets.Fungible.XRD,
  },
  shapeLiquidityPools: {
    LSULP_XRD: {
      name: 'LSULP/XRD',
      componentAddress:
        'component_rdx1crdhl7gel57erzgpdz3l3vr64scslq4z7vd0xgna6vh5fq5fnn9xas',
      token_x: Assets.Fungible.LSULP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntrysy2sncpj6t6shjlgsfr55dns9290e2zsy67fwwrp6mywsrrgsc',
    },
    LSULP_XRD_2: {
      name: 'lsulp/xrd',
      componentAddress:
        'component_rdx1crjdsyydayu8wuk6zayxlp26fxlsqghvn4cfr0vy5cqqv84qw9fzsx',
      token_x: Assets.Fungible.LSULP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfq77djs9udlkhg0ft3qyh2ksjfs0syehq36h5n6ysrr7kvedagzkw',
    },
    xwBTC_XRD: {
      name: 'xwBTC/XRD',
      componentAddress:
        'component_rdx1cp9w8443uyz2jtlaxnkcq84q5a5ndqpg05wgckzrnd3lgggpa080ed',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfdteayvxl6425jc5x5xa0p440h6r2mr48mgtj58szujr5cvgnfmn9',
    },
    XRD_xUSDC: {
      name: 'XRD/xUSDC',
      componentAddress:
        'component_rdx1cr6lxkr83gzhmyg4uxg49wkug5s4wwc3c7cgmhxuczxraa09a97wcu',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ntzhjg985wgpkhda9f9q05xqdj8xuggfw0j5u3zxudk2csv82d0089',
    },
    xETH_XRD: {
      name: 'xETH/XRD',
      componentAddress:
        'component_rdx1cpsvw207842gafeyvf6tc0gdnq47u3mn74kvzszqlhc03lrns52v82',
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nthy5lna9l0tgtfxzxcrn6hmle0uymrutqwnlcj8tuujpz3s62wlc5',
    },
    XRD_xUSDT: {
      name: 'XRD/xUSDT',
      componentAddress:
        'component_rdx1cqs338cyje65rk44zgmjvvy42qcszrhk9ewznedtkqd8l3crtgnmh5',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDT,
      liquidity_receipt:
        'resource_rdx1nft63kjp38agw0z8nnwkyjhcgpzwjer84945h5z8yr663fgukjyp3l',
    },
    FLOOP_XRD: {
      name: 'FLOOP/XRD',
      componentAddress:
        'component_rdx1czgaazn4wqf40kav57t8tu6kwv2a5sfmnlzlar9ee6kdqk0ll2chsz',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntpkcfe5ny37wk487ruuxj8wrgk6qg8rjq80m08un4yg98dmyj6msq',
    },
    DFP2_XRD: {
      name: 'DFP2/XRD',
      componentAddress:
        'component_rdx1cqaknlm9rfjxvzwhp7mzsjzustqpuqn6yhsmh8fn3zyr8sm5p3j7ny',
      token_x: Assets.Fungible.DFP2,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nt2vqgq43sr42pgfk625cl6yrzpreq5xqatkf2pgwm9dy7tjuv7e2v',
    },
    EARLY_XRD: {
      name: 'EARLY/XRD',
      componentAddress:
        'component_rdx1cpgf3nkgq4ry569rtn3pl6ytymuwh3d23w3vvawxfcnhhzm77e8jys',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfcf90emj9e2ujyuywwa0dsnqxlruar54gz4z7zjxmwtpx67xsrmnc',
    },

    husdc_husdt: {
      name: 'husdc/husdt',
      componentAddress:
        'component_rdx1cpat0a7p2ufty0lrawwtxfr3xm2qf5ys2xe6mlux4s074utzkz0w0y',
      token_x:
        'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
      token_y:
        'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
      liquidity_receipt:
        'resource_rdx1nfuh838gcphgt5h8az04k6zjvaqhe47tdzkrcwn3c50djuzl42qkhz',
    },
    heth_husdt: {
      name: 'heth/husdt',
      componentAddress:
        'component_rdx1cpdmqk0ujmyttnnh82lc05a578xgll6tgdadwt4crlnc4usfk75yn2',
      token_x:
        'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
      token_y:
        'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
      liquidity_receipt:
        'resource_rdx1nf7f0lerkda54tkuydm4chc2k4ml5cufmr09es9vvu7pamv73ewtjk',
    },
    xrd_husdt: {
      name: 'xrd/husdt',
      componentAddress:
        'component_rdx1cph6ayqwqgnavd5yjxjx966nfcnxwt85k9p8fqv37r5pfnn3qcm6az',
      token_x:
        'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
      token_y:
        'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
      liquidity_receipt:
        'resource_rdx1ng4val4sld9gjwhys6af3wsudk6xdrfr2rhsfswnmz474e2dxacv8x',
    },
    xrd_husdc: {
      name: 'xrd/husdc',
      componentAddress:
        'component_rdx1cqelumvmmgwths34k9pp0htd2ykwq7d70m0r389etwh39ul3j5tyj5',
      token_x:
        'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
      token_y:
        'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
      liquidity_receipt:
        'resource_rdx1ngsnjtypwayhkwnyu0swmh2ryu398xtq6gt5lz82n4tyyvs6qyd4wn',
    },
    heth_husdc: {
      name: 'heth/husdc',
      componentAddress:
        'component_rdx1cqly8sxtv7xfe8td9uxvyhw585szj2a5p220dn28ru5d2phcwdcgg5',
      token_x:
        'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
      token_y:
        'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
      liquidity_receipt:
        'resource_rdx1nf7wckadcrr0dlltm85ssp7w7autc07ae2gethr34w7a0cyrvmsh5e',
    },
    heth_xrd: {
      name: 'heth/xrd',
      componentAddress:
        'component_rdx1cqr24rye05h28qnn5crjwlq0djvfcmaegg8sgdkwywfx6s97nk9fcy',
      token_x:
        'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
      token_y:
        'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
      liquidity_receipt:
        'resource_rdx1n2hw9fr5eaa89gpxapjnjphdzc4u54unfunckz0dceqh9jl2hjgtqq',
    },
    hwbtc_heth: {
      name: 'hwbtc/heth',
      componentAddress:
        'component_rdx1cr4w4kezazrxwzy2yyndep2nc55j4plhpg8d4z57cd4u75rpqwfeg2',
      token_x:
        'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
      token_y:
        'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
      liquidity_receipt:
        'resource_rdx1nf28x9d9scutsfxrw3w55jmhus4r7g5xq742kttzkxmhymtv5juu82',
    },
    hwbtc_husdt: {
      name: 'hwbtc/husdt',
      componentAddress:
        'component_rdx1cr7xqqyn2anx5l85curcqy8z3rv9aprqf0axh9dkmsdfk9zfffer8m',
      token_x:
        'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
      token_y:
        'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
      liquidity_receipt:
        'resource_rdx1ntlj2z7vxej6xcdj4s4nxx478jmpk5jfc8pa7e9dcpcpu4rcnuyvrc',
    },
    hwbtc_xrd: {
      name: 'hwbtc/xrd',
      componentAddress:
        'component_rdx1crmvyl8nghu4g9ssxjq3yns793mqpn7nkc2cx5rmd2rzkaw0x755cu',
      token_x:
        'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
      token_y:
        'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
      liquidity_receipt:
        'resource_rdx1ngj84n8y5wnpu6vff40l04k2eecryp8zlcu5ff68j5vrf6q484ac6y',
    },
    hwbtc_husdc: {
      name: 'hwbtc/husdc',
      componentAddress:
        'component_rdx1cz2p7z6dfnns6ctcacns96rnxmaxuhlxwns6cyd8avd8jnemnj9kvf',
      token_x:
        'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
      token_y:
        'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
      liquidity_receipt:
        'resource_rdx1ntl0y0z5cgqc8egu35cm2yeqtvyafpvfgszt2q6008xreec4cnd0qg',
    },
    hETH_xETH: {
      name: 'heth/xeth',
      componentAddress:
        'component_rdx1cr4lw3pfgeel7fex4ur53k7k63s5wu3q28mtr5mpp3hddug55pfwy3',
      token_x: Assets.Fungible.hETH,
      token_y: Assets.Fungible.xETH,
      liquidity_receipt:
        'resource_rdx1nf0jww747g422rs9nekfunzq8y8en9qwtm59zf3t7ushjj8sxq08hz',
    },
    hwBTC_xwBTC: {
      name: 'hwbtc/xwbtc',
      componentAddress:
        'component_rdx1cp02473rjv7gxxwxa3xu9wn32um5h9t6wjm0azn6eqag639fc0ts9h',
      token_x: Assets.Fungible.hwBTC,
      token_y: Assets.Fungible.wxBTC,
      liquidity_receipt:
        'resource_rdx1ntpl2m2phtrgs4pee98nlvfet86w9y0j7rnvdfjlanrmawwpx3kwcs',
    },
    hUSDC_xUSDC: {
      name: 'husdc/xusdc',
      componentAddress:
        'component_rdx1crnu90a65rkdswza2sfk734yu29zh0x27ur0wqwntdfe8gm9s42yfr',
      token_x: Assets.Fungible.hUSDC,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nf28trqttfav6drssyqgc2vjl66kewxh3y2w0z8fws5kjj0lwetmdq',
    },
  },
  simplePools: {
    REDDICKS_LSULP: {
      name: 'REDDICKS/LSULP',
      componentAddress:
        'component_rdx1cz7s2xn8ddpmgm3uw0ma4jhaxhxdwce253v9j5agvffhftny6rgh8n',
      poolAddress:
        'pool_rdx1chmx480a0crrnaqyg2e6tr7wtqwk5239grzs6ecckcmhqjm3gdmm73',
      lpResourceAddress:
        'resource_rdx1tkjspzkzmhyzxwcrjha3y2aapmg5690vayjehqtfa729jnr88hcaue',
      token_x: Assets.Fungible.REDDICKS,
      token_y: Assets.Fungible.LSULP,
    },
    FLOOP_XRD: {
      name: 'FLOOP/XRD',
      componentAddress:
        'component_rdx1cpc6hjytxcvddl3e38u9amkn52ly3vzw6r0pxu54ge43l4ttw9ym7c',
      poolAddress:
        'pool_rdx1ch3vyhagpzqll4cu6quafdpkf7lvyuz7ke4z66tuqpxhvtxzd9lvmu',
      lpResourceAddress:
        'resource_rdx1th2pnc0lzgp20wwv2r22knjn32ntvecapws6v7z644c0d3rzz0fvng',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
    },
    HUSDC_XRD: {
      name: 'HUSDC/XRD',
      componentAddress:
        'component_rdx1cqth4gp6fedux4rrjzk6gu04c24sfnhzrh9t052ufsh7n5ljrslltw',
      poolAddress:
        'pool_rdx1c5dcv0r8tz0tzw8radv3grwvdj6jkya84c93k30mqmx70tyatlye0n',
      lpResourceAddress:
        'resource_rdx1tk9hawstw3k86c7qynvvr5tssttnsy4uurkz7d36fkz8cug9yw9925',
      token_x: Assets.Fungible.hUSDC,
      token_y: Assets.Fungible.XRD,
    },
    HETH_XRD: {
      name: 'HETH/XRD',
      componentAddress:
        'component_rdx1cpwu2rv3p4qqsayk5tc072kw94ygqyusemuqje7udxhgt3253m830q',
      poolAddress:
        'pool_rdx1chcefkz8qqlhl4tk6vm2ftwh7qmht8yru5cxwl0e5r444tw86vzjwd',
      lpResourceAddress:
        'resource_rdx1t5qpw4hf8k60mvn708c46rm7wu8st7kaqwy98nkf987fa2w7ue8kyz',
      token_x: Assets.Fungible.hETH,
      token_y: Assets.Fungible.XRD,
    },
    HWBTC_XRD: {
      name: 'HWBTC/XRD',
      componentAddress:
        'component_rdx1cpftfjyyyrca5twzsr557at8uka20ynsn5wucy9pe7sgxnrse24m5h',
      poolAddress:
        'pool_rdx1ck3ckkse8g2ct0ep4gcymctkfs56ff37lfwlg4w3ehwvgz64evlhf5',
      lpResourceAddress:
        'resource_rdx1thzkkqkeye5qzp5p4nweux47v2elz3v693dg6z20q2ayxaxmdjy52h',
      token_x: Assets.Fungible.hwBTC,
      token_y: Assets.Fungible.XRD,
    },
    HETH_HWBTC: {
      name: 'HETH/HWBTC',
      componentAddress:
        'component_rdx1crm92dlh8clzlgvr3dy06ud3l0ye0p5lvmga7cfq0shjp4l05cjrzf',
      poolAddress:
        'pool_rdx1c4wszvdz7nhjhez0ylyykw6pa8uk9d6k3ae53tmenwhj2w92qhe53a',
      lpResourceAddress:
        'resource_rdx1tkhvjj3cnkh8qt50dlza6fjdtv37n00dta9lr4mlt2yrd8yj3n7m5l',
      token_x: Assets.Fungible.hETH,
      token_y: Assets.Fungible.hwBTC,
    },
    HETH_HUSDC: {
      name: 'HETH/HUSDC',
      componentAddress:
        'component_rdx1cq7wwa9p4fpnksd5sw7lav7ayu5xt9e8l0nges6lwnnxyhcrxsc4ff',
      poolAddress:
        'pool_rdx1ch73xqzrkl9h8ph6t3870zzd5azg2e8l035sh4supw5m4fx4g5qy7c',
      lpResourceAddress:
        'resource_rdx1t5ed9l2gj23esycjwvjk2ylawdkmy272lnu7mt00rvc5kxemd6fh2q',
      token_x: Assets.Fungible.hETH,
      token_y: Assets.Fungible.hUSDC,
    },
    HWBTC_HUSDC: {
      name: 'HWBTC/HUSDC',
      componentAddress:
        'component_rdx1czs3nlt4vx8rq0qytvxtsxmjvppd29n72quelmvww4kx25ryz5jk0q',
      poolAddress:
        'pool_rdx1c49sgm0d82y03kazsqrpsqqchjyvqxnjgfms9g7avvy73fdvrua0vl',
      lpResourceAddress:
        'resource_rdx1th9wru7f8grz38apla0kaeelw30zn2da0e30mkzd0cyvzdjkpaewdu',
      token_x: Assets.Fungible.hwBTC,
      token_y: Assets.Fungible.hUSDC,
    },
  },
} as const;

export const shapeLiquidityReceiptSet = new Map<string, ShapeLiquidityPool>(
  Object.values(CaviarNineConstants.shapeLiquidityPools).map((pool) => [
    pool.liquidity_receipt,
    pool,
  ]),
);

export const shapeLiquidityComponentSet = new Map<string, ShapeLiquidityPool>(
  Object.values(CaviarNineConstants.shapeLiquidityPools).map((pool) => [
    pool.componentAddress,
    pool,
  ]),
);

export const simplePoolComponentSet = new Map<string, SimplePool>(
  Object.values(CaviarNineConstants.simplePools).map((pool) => [
    pool.componentAddress,
    pool,
  ]),
);
