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
    FLOOP_XRD_2: {
      name: 'floop/xrd',
      componentAddress:
        'component_rdx1cz839fe20qs607t2el79wct6wmg47s0vvcw0w2lm5zujtxrf7e7w6y',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng59sgyq5uu3nlmstnkuavqvsjzg7f8hrlst4hreymydxpx9csxt40',
    },
    XUSDT_XUSDC: {
      name: 'xusdt/xusdc',
      componentAddress:
        'component_rdx1cpvdwxr6j7ktyh4uzjqu36rc3tgdaunymr3gw5mf8nk3nmre6nfxuu',
      token_x: Assets.Fungible.xUSDT,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1n27zgl8drw94ln9kpayusj8f6nuh3hgccln54tn5qtluqw0cvfpqet',
    },
    XRD_XUSDT: {
      name: 'xrd/xusdt',
      componentAddress:
        'component_rdx1cpauecnfye2kthe8y9eu2vl0fm3d6nnaldf3e0au46tk7cvj2ppc7e',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDT,
      liquidity_receipt:
        'resource_rdx1ngx9d2mc6e3lcdqsssv4asn8yalznlp0tvg5djux9zh0mq80kqlhvc',
    },
    XRD_XUSDC: {
      name: 'xrd/xusdc',
      componentAddress:
        'component_rdx1cp260lsjzc70rllks3474jemjxcq775dtvfyuf53kn6l36f72ztcww',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nfzpyryg5x5x3586dgcka44884f99rjcrusvwgkkc3jatzuwk6tflp',
    },
    OCI_XRD: {
      name: 'oci/xrd',
      componentAddress:
        'component_rdx1czapcclk3ltvrq4a03up0elsfk9yupuy27k07v44ph4det4aswrw63',
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n247nmdjzpw6nmascnu7cp28hafw4xrdm0m5px85udklxd6fv9qpck',
    },
    IDA_XRD: {
      name: 'ida/xrd',
      componentAddress:
        'component_rdx1crrlfyyqc2hhy5s7mykknakwanctvv7dq4krgthdecjnulf5m7986j',
      token_x: Assets.Fungible.IDA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngtejqae5amspts7lfy8f8ewysaaywf64ht6dhz8m64mp30q0rsqsn',
    },
    FOTON_XRD: {
      name: 'foton/xrd',
      componentAddress:
        'component_rdx1cq6la8r8dyf2y7ta8pw2f7lmfwsule9jcl698t0cd3sxwnufy7qgsm',
      token_x: Assets.Fungible.FOTON,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntstd40tjkcz9gyms93a5j2vury02f88gw93ype5ntkupk7l65mc9g',
    },
    CAVIAR_CAVIAR: {
      name: 'caviar/caviar',
      componentAddress:
        'component_rdx1cpqj6t2q9unetgvsnfgcmep90fc9y99gzzd58tkslu2etq0r4xs6zm',
      token_x: Assets.Fungible.CAVIAR,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1nf5mryfax4l68mmgyu2axv66pwep3vhn7zj3g3uxs9tecn460kh3f7',
    },
    FLOOP_FLOOP: {
      name: 'floop/floop',
      componentAddress:
        'component_rdx1cr0w53k4vnamnf4t5dg6tsaed653x5eyac9dtdfjddu2qzt3mmuj74',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.FLOOP,
      liquidity_receipt:
        'resource_rdx1n27q4yrfe8famnc9mx2zsgq3ny5vuywu49a0mn5un7xs39m36hulx8',
    },
    XETH_XRD: {
      name: 'xeth/xrd',
      componentAddress:
        'component_rdx1cpgygdx0kcfkesy0mstx0q78wwtgx7h6cv30wzexzphahsgz8ge7ad',
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nttua9ga6zspf7ajgv2jtn3nd335avm2d5szeg963nhgn0s6camx8y',
    },
    DPH_XRD: {
      name: 'dph/xrd',
      componentAddress:
        'component_rdx1czjlfp630kn7stfzzjhdfgnfxdyxkx56ehud2qd2lgslh8drp54kg3',
      token_x: Assets.Fungible.DPH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf9k99dv6gfcm6y6zjlwuljp2jpv87uxl3nhswy3yea4jrhkq9gf7j',
    },
    FLOOP_CAVIAR: {
      name: 'floop/caviar',
      componentAddress:
        'component_rdx1czx8584xqhqgqwyqertx9ms0008kw3xscfkdgcemhqwmzk8j276lur',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1nfu54v067ffcla9jvea35y8xfh53anhfgcsj56r7rvfufuasv2mk0z',
    },
    GAB_XRD: {
      name: 'gab/xrd',
      componentAddress:
        'component_rdx1cpuefg8gprueeflnwdkgcerj8gf0epysudrrmqarv72cmyru8h9drp',
      token_x: Assets.Fungible.GAB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf9z9pmhaxde0k6h6dc6hd3gql8nelvhsnn9n2aqc5g432k3tp8n0h',
    },
    OCI_XRD_2: {
      name: 'oci/xrd',
      componentAddress:
        'component_rdx1cz0pzuq27n3vu0qr50ze7uq9rlzyz3zmeepqatc6r3jf0htrjr8446',
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2ag4s40rq7463g9vpa6a0cmyzsz6qx0cs8ckyrqqfkkmfz6t43k0a',
    },
    ELT_XRD: {
      name: 'elt/xrd',
      componentAddress:
        'component_rdx1cq0avrlht6kddqdjpwhhuhm6galddjcp3e9tmp0e5lh3nrk8kddmwt',
      token_x: Assets.Fungible.ELT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntt5x5s00jcg7p6x8krlgq5kzfx07qe4frzkehyq30f5ge70w07a5f',
    },
    GAB_XRD_2: {
      name: 'gab/xrd',
      componentAddress:
        'component_rdx1cra9rqpj0n8zgecy0ksgaxppwdv3jhzzw67ksedn4zv0vkamtspgj4',
      token_x: Assets.Fungible.GAB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntexzudfp9zyg9r35lqw0mt0qmz6lhuhvy6vve92fl3l3vceju8rjk',
    },
    GAB_XRD_3: {
      name: 'gab/xrd',
      componentAddress:
        'component_rdx1cq3jkzp5v6hl87dhsm2aa92c8jt9pzxfcxr90wspfuqrd6jkmhxesd',
      token_x: Assets.Fungible.GAB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngfq9uvplsc3hgw5f3magfzaylmczghfqdt26t8zd4a33ayu5rckcf',
    },
    RADIT_XRD: {
      name: 'radit/xrd',
      componentAddress:
        'component_rdx1czmdlfls00xys8nfquqp5vyy7suju5dz2r2wqs4esc6jwvscpypcwj',
      token_x: Assets.Fungible.RADIT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngglaljeqkh53pq83csyzu8g30w3yys5fzhcxvwf4c7r4k7a3jgnf5',
    },
    SCAM_XRD: {
      name: 'scam/xrd',
      componentAddress:
        'component_rdx1cp2ml5lm2em8ry72k0jeqryk6dp0wvzwjma4x9r5yzag83q5t8a98v',
      token_x: Assets.Fungible.SCAM,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntltaqs9m57w634hurafevsnnfj2vztdwyhlrs3v4trs328arxracs',
    },
    XUSDC_XRD: {
      name: 'xusdc/xrd',
      componentAddress:
        'component_rdx1cpy05y22jyfdtcmtf6rjxze7w788unse2mnm60gvllgxk7xwceutfh',
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2purun2dlwpkf424pgwpqrc3y0epl3fdkz0fxp9ksks4f53js2g5z',
    },
    XUSDC_XRD_2: {
      name: 'xusdc/xrd',
      componentAddress:
        'component_rdx1crnymtryzynv0vj9s78xswxgplzrx3pp7dcn7zjgw50extlayjytgw',
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfwtjp8jke3tqknw50jqd9my5gysvdtlg4sngzlwgplqfaa9w3eqhg',
    },
    FOTON_XRD_2: {
      name: 'foton/xrd',
      componentAddress:
        'component_rdx1crfzhj5gwz8xzjxfy24mqm0g072ye8exgdgvvkvf3gcayjcv2z0k8x',
      token_x: Assets.Fungible.FOTON,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2hdc6gnyr2lgt98g023enux546xc4r9nshkke6pv08cu0j6hlusmx',
    },
    NOTETH_NOTXRD: {
      name: 'noteth/notxrd',
      componentAddress:
        'component_rdx1cr7scefltr6y9ljknuctd9j2qdc9k53063p635xwlrk50msfksna6m',
      token_x: Assets.Fungible.NOTETH,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1nth7etrt782mc8fqflsgzfsnughj0u3vs20sgs4vy7qcqfcdlx2gva',
    },
    NOTUSDC_NOTXRD: {
      name: 'notusdc/notxrd',
      componentAddress:
        'component_rdx1cpl4pf7sh766cnd6wjcwkc6tx54ze3qy4jf50d22wc2nuz54zzpa0q',
      token_x: Assets.Fungible.NOTUSDC,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1ng3uv9tu3c0n63c6qkpg6mrdlv3cdlc7nnq584ur3mldnq6fl7p8r5',
    },
    NOTUSDT_NOTXRD: {
      name: 'notusdt/notxrd',
      componentAddress:
        'component_rdx1cqfszkwhtxm2wwl9puae9n833j8c5hrp9tasw9escun2nvkptj7ggz',
      token_x: Assets.Fungible.NOTUSDT,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1ngxcptrp3s9wpq8slrwzj8fceqspx8muutkmgfqufvd4vs3f04pr7y',
    },
    IST_XRD: {
      name: 'ist/xrd',
      componentAddress:
        'component_rdx1cqys2yf6u7nva9vak2l4see6g3hpaklclj20jmtrhexrcyadknnyah',
      token_x: Assets.Fungible.IST,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2a3a0k95nfv0hncgaggjnlhvzxgl4rh9czaf92gajdquy02rcmv7k',
    },
    GAB_CAVIAR: {
      name: 'gab/caviar',
      componentAddress:
        'component_rdx1cqly7trprv4vpvh6yzf0wafltvu393lxq8w6tylyhmex9p43sw7ygg',
      token_x: Assets.Fungible.GAB,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1ntwusgkv99y4y0krqeahdp6hpvfk6qwpls4ycf29rt088ucf08f9ay',
    },
    GUH_XRD: {
      name: 'guh/xrd',
      componentAddress:
        'component_rdx1czrswlzpne77h9zaj5phrgudtl260ukgywuf7pdjxjx52yj0t6cpcs',
      token_x: Assets.Fungible.GUH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngwvpt393t366n0yzqkmtxtsjlauc47wvglpmysp7ydjuy8s9tzjzx',
    },
    THC_XRD: {
      name: 'thc/xrd',
      componentAddress:
        'component_rdx1czxvddyrvgeqd5c63gg43tasst9lqyracvtyyrxqm2hkkgmgn7vxnm',
      token_x: Assets.Fungible.THC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2lyq7y4nj7mx883pf4zfpu4luqg458suvzvwrjr0qkacmwekf09t8',
    },
    XETH_XRD_2: {
      name: 'xeth/xrd',
      componentAddress:
        'component_rdx1crennqxtn9axwfj4juccy9le0jw6m0fuyzdfu7vs5834f9nwtk5352',
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nt4mm2nncse2lx2xp2wa7g3q8xrjgkwysepfh3w9cme4vuxp3fpc9q',
    },
    MRK_XRD: {
      name: 'mrk/xrd',
      componentAddress:
        'component_rdx1cqvp59q90amkklsgz86xhxmj0su6p3jjchhthttjq2w0v9sr5pw0m5',
      token_x: Assets.Fungible.MRK,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfd963jz8874zydx4thja45ffdvlcpp7rg7mzscd3lwy35a4hlehel',
    },
    HUG_GUH: {
      name: 'hug/guh',
      componentAddress:
        'component_rdx1czn8779qadh9226fd30lfmt4gfvm467lqn7kpxuuc3qvq75vyjs0gc',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.GUH,
      liquidity_receipt:
        'resource_rdx1n2dxmz98gznevc3ljsvr33swqehnacjmu9a8uhuwuxyrnnatqyqdp5',
    },
    SWT_XRD: {
      name: 'swt/xrd',
      componentAddress:
        'component_rdx1cr7ax6v2lsrjp7v6kgzv2qkxsy46dukwq4n8lgx5lelt8kqdcfp5t4',
      token_x: Assets.Fungible.SWT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngd6gx38ppaxtca8f0uypzlk2ev6yv0wwumavc05lltq3uvzj7ud5l',
    },
    FLOOP_SLG: {
      name: 'floop/slg',
      componentAddress:
        'component_rdx1cqkyee7zthrtqgh77lch7tu6h895q3na55lqsf74y09d6n8dkd96c3',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.SLG,
      liquidity_receipt:
        'resource_rdx1nfvvcc7d6zp65y4dn0gaa5ucjun49pwvghzsc72v6chvq8g0zc7lay',
    },
    TWERK_XRD: {
      name: 'twerk/xrd',
      componentAddress:
        'component_rdx1czykpkvsjjc8s97tuu53d03egvxugucv95zs5whu0v2gw2hq2w4ylw',
      token_x: Assets.Fungible.TWERK,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2m9tz65zlwne5dcynxs4r9v8agn3k2gkh684kx585urmauk8cxctn',
    },
    FIRE_XRD: {
      name: 'fire/xrd',
      componentAddress:
        'component_rdx1czhw0jclt5e23vrgzrew00whma63xpr9gmkd6993zwfx2a8l9gpget',
      token_x: Assets.Fungible.FIRE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2kkgs3c5gj90w96g5shf6sk6pc9ulkfhflaeu9dr3w3g5h4dmwf9y',
    },
    PANDA_XRD: {
      name: 'panda/xrd',
      componentAddress:
        'component_rdx1cptfe3q9eclnawvpkue48vn2f23tcllyp4mhug2zfqx32daep73y0g',
      token_x: Assets.Fungible.PANDA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfdpd3q5dxrh70sgjfxqhythkqpcq0p8g5clc6yg7vlt5shkrnfl0n',
    },
    XRD_XUSDT_2: {
      name: 'xrd/xusdt',
      componentAddress:
        'component_rdx1czaa66y5nal99hsqwj3vkcvdv00q8g8dtrxjy82rfcj9g4pffxc4r4',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDT,
      liquidity_receipt:
        'resource_rdx1n2cy0g557lkr5kkqw5yg05ly2d2gerd5yef7w82588jdtrzfese08y',
    },
    RST_XRD: {
      name: 'rst/xrd',
      componentAddress:
        'component_rdx1cpjpnk24dnksr7hncgeaj4wzkgrc962gyfyrg5g3yle88pewcc3xhx',
      token_x: Assets.Fungible.RST,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfn2xnr6cz8vg9hxheu9tr5tc7zyztwmzj9umeqf4pfqmqqft3m6fq',
    },
    JIT_XRD: {
      name: 'jit/xrd',
      componentAddress:
        'component_rdx1czu7mf6s7hexungqqxsy8w5vt0pywnvp0unwsq4pp6v69qyecswd73',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntqghq7ey3j2j7uu2xrf00xkmte6pyz6s0kg7z962sjqrc6q2grxn8',
    },
    FLOOP_LSULP: {
      name: 'floop/lsulp',
      componentAddress:
        'component_rdx1czpcjhpyeldmn2f2vagv5pt7d6skwa9e4e6ulvt9phlvl8vq354g3w',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.LSULP,
      liquidity_receipt:
        'resource_rdx1nfemyp0qpzpgxffdnmer8dvtgaj0n4jdcclvt4krvxfyucumcfpgln',
    },
    CAVIAR_XRD: {
      name: 'caviar/xrd',
      componentAddress:
        'component_rdx1czat8nh9wnw5usewuwa6naqpm3yaw283srxv9j4dplwz2v2my96tm8',
      token_x: Assets.Fungible.CAVIAR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntvsrl6z4gqg5eqctv85rtwtgmc72n6uwyd6vkwsqf2uky2qanwpz0',
    },
    XWBTC_XUSDC: {
      name: 'xwbtc/xusdc',
      componentAddress:
        'component_rdx1cpsnknh6zm68uaj22c7xuzr34q4yfzu443qrq05rkjtuvc7wdegl5a',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ntelcq762pdm8vcsar8ggqem0kyjslq2dp36cv3d2rsgt56twcvrm7',
    },
    SCORP_XRD: {
      name: 'scorp/xrd',
      componentAddress:
        'component_rdx1crfpvcfr8e6htvnq7zgzem8flqzwed5vmd6wtr53aku0u0ymrpdt06',
      token_x: Assets.Fungible.SCORP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfkdj6l8w7dpez23s7r2t9fnt7qrqe5wtnh2expj978kqtxcrr2nw9',
    },
    HODL_XRD: {
      name: 'hodl/xrd',
      componentAddress:
        'component_rdx1crv7mdktxs3vcaqfmwwnhkzw2seykvycp65kuakxzl239yqh8ytz90',
      token_x: Assets.Fungible.HODL,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2d90slwzmwq8w9c0jrjhnfzlevs85ysru5vkjhn8z059dvqm28pm7',
    },
    CAVIAR_XRD_2: {
      name: 'caviar/xrd',
      componentAddress:
        'component_rdx1czw90lhpt9mjka6grtsdymnqqvpeszx440v0gqpqwrvahhnr9hctnq',
      token_x: Assets.Fungible.CAVIAR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2ch9vkhqjgpk08f3wzhykd76w8268uzhrqmn62aghpfvhyknqmadd',
    },
    XRD_OCI: {
      name: 'xrd/oci',
      componentAddress:
        'component_rdx1cr0v9utedwrzjjtvtvvck9255m6hrrpvja8f58kukq8qxyv84uauvu',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.OCI,
      liquidity_receipt:
        'resource_rdx1ngzzw72xvlzfpwrxe99ppm3gve6939nxl9hkyt0n3neuq34j6gx5tv',
    },
    XRD_CAVIAR: {
      name: 'xrd/caviar',
      componentAddress:
        'component_rdx1cppdz9d7qxmzu3hdtaew9r6dlm7zm9jxl8judp70tplv6324k93080',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1ntcaez443pvq9x2qysfszq2q2uhhy8l9cwn7sjws9puy3smzf05tjz',
    },
    NOTXRD_NOTBTC: {
      name: 'notxrd/notbtc',
      componentAddress:
        'component_rdx1cpmc97exkthgdzkanwc0pa8vj065d9x4fzurlyhncdgyzlhs3t28nq',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTBTC,
      liquidity_receipt:
        'resource_rdx1ntvmycsxwepeyag433023aue8xmwyj6eamzl8jpzk0a84y4k55mhmg',
    },
    NOTXRD_NOTETH: {
      name: 'notxrd/noteth',
      componentAddress:
        'component_rdx1cp48zehj7p60vwv6zv5cmq6t6kama474e6zkpup23fuel4ywg6sfjy',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTETH,
      liquidity_receipt:
        'resource_rdx1n2jxap6d0uwe9vqd4kqwarsf75vlvvsu7p2cxzdgas8t4k8hr5fj94',
    },
    NOTUSDC_NOTXRD_2: {
      name: 'notusdc/notxrd',
      componentAddress:
        'component_rdx1cpumgp0p6t69zxcv76wyhy3a907nx4muee5684xwesj79wxeh57kyl',
      token_x: Assets.Fungible.NOTUSDC,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1ntluyggsk93tvxysygpckf9m26ecfe87xaxay60pfuvd5r0uayq64j',
    },
    NOTUSDT_NOTXRD_2: {
      name: 'notusdt/notxrd',
      componentAddress:
        'component_rdx1cpw0dca6a4plkj60au36ljfw40snh902td5v6zz2araw7qjmjgasea',
      token_x: Assets.Fungible.NOTUSDT,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1nfxyy72gfjna5h2gxn2lt788jxyp24h279wa5q2tu98v65vgc45yth',
    },
    NOTBTC_NOTXRD: {
      name: 'notbtc/notxrd',
      componentAddress:
        'component_rdx1cqutmrkrylqtx00mglz34hfe283dfy7npm6enf3us5hryacm22jntq',
      token_x: Assets.Fungible.NOTBTC,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1nfr9cu2ajypaf4pczan56jaw2pjkpyqej9wk3u7nrs0jx9emac3n7l',
    },
    NOTETH_NOTXRD_2: {
      name: 'noteth/notxrd',
      componentAddress:
        'component_rdx1cpu0tkqjfglg3jaw0tsrfz52tfgrcqyrh9tdzw5zkj3jwqq0vrrlwu',
      token_x: Assets.Fungible.NOTETH,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1nfc7p559esa4rukgufe4kl0gqe3ksy0uwqtp3z9nu9au8gj8qrdy85',
    },
    NOTXRD_NOTUSDC: {
      name: 'notxrd/notusdc',
      componentAddress:
        'component_rdx1crzazhl2m7993fwqzwmf2zxqs6qh4lrjf7gj2dpzca8j6gex335ld2',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTUSDC,
      liquidity_receipt:
        'resource_rdx1ng4n0y7ny240cq2ty7pydtwvzdgstfdkeevs9lgjm4cumj62e0yqf7',
    },
    NOTXRD_NOTUSDT: {
      name: 'notxrd/notusdt',
      componentAddress:
        'component_rdx1cqesyz0a6dkzyvzghd4p4ev82df8xt0nvyzaqrqy4n99swle2wq5vd',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTUSDT,
      liquidity_receipt:
        'resource_rdx1nfc9tmqtupq8d82jn470m0k64xlchmaeawat4uk7t3qy4zn8pcmfxl',
    },
    NOTBTC_NOTXRD_2: {
      name: 'notbtc/notxrd',
      componentAddress:
        'component_rdx1czxuyg7pqmpgtzshxqa8d3htmpmyag7r55ly2sze5nfj6579a5hplc',
      token_x: Assets.Fungible.NOTBTC,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1ng9ca7ckkqmecw3qwzyv7z86dlc3lcd0un2z7tumpe0zj0x93y837t',
    },
    NOTETH_NOTXRD_3: {
      name: 'noteth/notxrd',
      componentAddress:
        'component_rdx1cr46zcmfk3fu506npqdknmdvel64e3txc9j9cltq9z9c3enxjhzdgv',
      token_x: Assets.Fungible.NOTETH,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1ngrru07nykr5asqps6ta6xdurpl5h8rwupa60qsk322ew382fffusl',
    },
    NOTXRD_NOTUSDC_2: {
      name: 'notxrd/notusdc',
      componentAddress:
        'component_rdx1czv4hqjxcrjzpjv6qjl03u3w507tlku3u87ndqqgjsdx0vnaaylc6s',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTUSDC,
      liquidity_receipt:
        'resource_rdx1n2ek4zcpdz3m54q48zyqjhezdgslyk32csen6mttnu53dstknha6f0',
    },
    NOTXRD_NOTUSDT_2: {
      name: 'notxrd/notusdt',
      componentAddress:
        'component_rdx1cp5udka2gw396f3l2lhrtr2f2w67q24t850xktraa8qkrg7ax6x6s8',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTUSDT,
      liquidity_receipt:
        'resource_rdx1ng72mqmd2r4sm5pwta8n6w8grz2e8kjcx52w9hmhh7q0qyqmrej03y',
    },
    NOTBTC_NOTXRD_3: {
      name: 'notbtc/notxrd',
      componentAddress:
        'component_rdx1crzl2c39m83lpe6fv62epgp3phqunxhc264ys23qz8xeemjcu8lln3',
      token_x: Assets.Fungible.NOTBTC,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1ngj2s0ejgnu7q7fgutp8shguatq3zrpst46jg7y96cldhlwxrt23w6',
    },
    NOTETH_NOTXRD_4: {
      name: 'noteth/notxrd',
      componentAddress:
        'component_rdx1cqk2ufmdq6pkcu7ed7r6u9hmdsht9gyd8y8wwtd7w5znefz9k54a7d',
      token_x: Assets.Fungible.NOTETH,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1nthlsdp0nq3gl58uuza8kx52r7kdf5jxkn03sznm6mklulanpkr97v',
    },
    NOTXRD_NOTUSDC_3: {
      name: 'notxrd/notusdc',
      componentAddress:
        'component_rdx1cq9q8umlpmngff6y4e534htz0n37te4m7vsj50u9zc58ys65zl6jv9',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTUSDC,
      liquidity_receipt:
        'resource_rdx1ntnqstn5723as30sdsulek65tvw7u9qsqg4nathpma4fx973gvupkc',
    },
    NOTXRD_NOTUSDT_3: {
      name: 'notxrd/notusdt',
      componentAddress:
        'component_rdx1cpl0v3lndt9d7g7uuepztxs9m7m24ly0yfhvcum2y7tm0vlzst0l5y',
      token_x: Assets.Fungible.NOTXRD,
      token_y: Assets.Fungible.NOTUSDT,
      liquidity_receipt:
        'resource_rdx1nt6rkystfahe6rcrmm6u0usdgds5yaprc4kkvwrhte9vy3ra5dl0q6',
    },
    FARM_XRD: {
      name: 'farm/xrd',
      componentAddress:
        'component_rdx1cqt6vv8zgcjvys45k5kvxfd978lfjlln6stsvzuaq8yz2v3u9q0nun',
      token_x: Assets.Fungible.FARM,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntmzpz7yc0q97pqjd85y5kj2yvyqz4faul3ny4m9wv389narv8zwy5',
    },
    FARM_XRD_2: {
      name: 'farm/xrd',
      componentAddress:
        'component_rdx1cz5aaqujs20hkmuj5xwkrdlwcuycwtg2mmt6fn2tsy09sxmpd59cny',
      token_x: Assets.Fungible.FARM,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngr7mnhpqkydqjj37c3tfugmxzc7h96g83zel0aal5tuc22r42jtmy',
    },
    DGC_XRD: {
      name: 'dgc/xrd',
      componentAddress:
        'component_rdx1czzpff4xscdrhrj4pl6hcd0ylmpfxk7k7rrl44wnmn36rqhpzpf5sv',
      token_x: Assets.Fungible.DGC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n29ufu9fj9yh66q8c9l30rx6hqat6n2mccm9dl7shtl07l0l4g7qhz',
    },
    EARLY_HUG: {
      name: 'early/hug',
      componentAddress:
        'component_rdx1cqzftk9u8eh6x5yg7re5snk8az47csktk86z9tjcw0mv42jns3750w',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.HUG,
      liquidity_receipt:
        'resource_rdx1n2agvjndt8hm55cpnehn786lvk93cd0xe8rdgz05s7k4n7e4trrk6y',
    },
    POPEY_XRD: {
      name: 'popey/xrd',
      componentAddress:
        'component_rdx1crzy5fdmz886zvuq0s7gtf526456ey00nyt7qpm3hkj7w5q76pedtk',
      token_x: Assets.Fungible.POPEY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2gk76phe84p5qhw8suqjx9sglxp78lcr756ft0qn3a6jjpmyrj6s2',
    },
    SIM_XRD: {
      name: 'sim/xrd',
      componentAddress:
        'component_rdx1cqu9m8e0rv9vzt3862xd8yn908mxskkf4yytv0ahqglspvd8v0623y',
      token_x: Assets.Fungible.SIM,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngt9e5x89fhchtwc56esv4gcrz6qv67qhtqa0prjl4rmts8hcd4mrr',
    },
    MNC_CHUG: {
      name: 'mnc/chug',
      componentAddress:
        'component_rdx1cp76ypyv8uktze38w5sl298gw7rx4gg8ne8rdw6vv9x26rsacf8ckk',
      token_x: Assets.Fungible.MNC,
      token_y: Assets.Fungible.CHUG,
      liquidity_receipt:
        'resource_rdx1n2s63psuje5g6h4h2z6x0tkw4zr6eqma6qulklxed3ccdg72qv7py6',
    },
    BLSS_XUSDC: {
      name: 'blss/xusdc',
      componentAddress:
        'component_rdx1crc6d3mjscj3xglt0qm0c9uq0lcq6rtw50z6kcnwt9m4qg5mc6dkrm',
      token_x: Assets.Fungible.BLSS,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nt8tyszehywtt63us962v62awgz89pqu5mepvq2gnjf96t5gsjjgjq',
    },
    XETH_XWBTC: {
      name: 'xeth/xwbtc',
      componentAddress:
        'component_rdx1cz7y28yaf55x7se3ewfds0chr6ktwkrs5zqrwxdj0nl7w4k23vd3h2',
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.wxBTC,
      liquidity_receipt:
        'resource_rdx1ngdn5vhljea0f50frrsxfavxkted3jry608lnm3utfjr2z4pusz6zy',
    },
    EARLY_HUG_2: {
      name: 'early/hug',
      componentAddress:
        'component_rdx1crgsk0lhfr0dldgr320t9tu92v7wzta3c74u7v7prtsq8jzj4hrwez',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.HUG,
      liquidity_receipt:
        'resource_rdx1n2jlw8yvyc0plejtga9x3uvjayuppdavkgaakatklyfhl4wuucn4ry',
    },
    ZRCK_XRD: {
      name: 'zrck/xrd',
      componentAddress:
        'component_rdx1czxzh4qs2pme5xsujg8pgxh7aukm55lx7tlrg7hpenl8ka4nralq2f',
      token_x: Assets.Fungible.ZRCK,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng8cuzyrtpa5capf3jvsv2lgqa95jcg4tsulyamwyqjxnvyrv70g2n',
    },
    NAKA_CAVIAR: {
      name: 'naka/caviar',
      componentAddress:
        'component_rdx1cp6hcdq8pslud4zcx8uayl5u5a3wfqc2zs3me5saetj87f8zy8euea',
      token_x: Assets.Fungible.NAKA,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1n2cuxeh66alfgx025fdzey89d7235v6tnqyafhm66vg0l9rmp5473k',
    },
    NOW_XRD: {
      name: 'now/xrd',
      componentAddress:
        'component_rdx1cq0vthte6e5qss8lspxkcm9mes2dqjtgncejuly8zcawsvvgjv6e92',
      token_x: Assets.Fungible.NOW,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n29twek757glqht2ra8retehwgpwasrq77qjadpfle60sshrypg32u',
    },
    KURD_XRD: {
      name: 'kurd/xrd',
      componentAddress:
        'component_rdx1czz6ee2pn2c0ka296ur90geyhv6tgcxcsd7dhvxahxl5236vfxmz99',
      token_x: Assets.Fungible.KURD,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngckuq8ldd3qxhrfy3amauxdm23zts76xgyy2eesgtmu0jcyzls5ps',
    },
    WOWO_XRD: {
      name: 'wowo/xrd',
      componentAddress:
        'component_rdx1czk2xdfvz3n2mvytf7ycqr6sdlvtv2k7q3tgv9r4s4yvka6nggthhs',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfalfdrh6q97sh0tchlax666lgcuh97g03a67chhts4d86spl0dxl5',
    },
    FOTON_XRD_3: {
      name: 'foton/xrd',
      componentAddress:
        'component_rdx1crzmca8csgcqg6f26py6yqydark5wnjg9tz3c8gaffew98x8ldfpgq',
      token_x: Assets.Fungible.FOTON,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngs24wteq4fxgcdu20g2k535ar8pk34jndwasavru0g76ssq0mntx4',
    },
    COCO_XRD: {
      name: 'coco/xrd',
      componentAddress:
        'component_rdx1cqqttqejstttha3c4gtmk6vqwhk6xwjwewv3kxhm2ln0vjq0shpqww',
      token_x: Assets.Fungible.COCO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng2d5vyhjwd808fdw3fmmet5f8lru0fnvh98sld75gmznc6yh5jk2a',
    },
    LONG_XRD: {
      name: 'long/xrd',
      componentAddress:
        'component_rdx1cpzj4vle22pfch2z0xqlyx35phy9gnwxuv0vrkrh9wahn60hvyzccf',
      token_x: Assets.Fungible.LONG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntpex99qwrzrssj3pr59nkskdjvywj8u8v8297w9uqypax9jg63mmr',
    },
    RWA_DPH: {
      name: 'rwa/dph',
      componentAddress:
        'component_rdx1cre6q9drvucxmfxfdr5l83nr6k48ke2a8tjdf0q504lfqwwlaz6qau',
      token_x: Assets.Fungible.RWA,
      token_y: Assets.Fungible.DPH,
      liquidity_receipt:
        'resource_rdx1ng48ew8zu0y77d9c9zx70ypzu9jvh43ac30ksrd5ucal08kken8lz0',
    },
    ACR_XRD: {
      name: 'acr/xrd',
      componentAddress:
        'component_rdx1czlw6f0s62mt79ezda38fdy098fvwmpy8xg38cyqkrcwy5fkyh2qa9',
      token_x: Assets.Fungible.ACR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf8epk89d0fq7y9gxc4nwcpe9tvutsh4ydg4ptck03fzpphrxv2eek',
    },
    CREW_XRD: {
      name: 'crew/xrd',
      componentAddress:
        'component_rdx1cq4rc7c6akj3u6vphxe7x5cugmkcjzw4d34h3ask59nea262ura3qr',
      token_x: Assets.Fungible.CREW,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2urawkxyls6vzlc50rndm4wpge5ckazny8dd3q9czmmvvtk66n2wh',
    },
    DGC_XRD_2: {
      name: 'dgc/xrd',
      componentAddress:
        'component_rdx1cphz052a64q3xxdk2jnn030avvlqegjegjg62v435re3qe604fg0zf',
      token_x: Assets.Fungible.DGC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfatqjvsfvmgvhleyrp02q5wrk3sh5allze4fwu4ynn0z8frn74xh0',
    },
    DINO_XRD: {
      name: 'dino/xrd',
      componentAddress:
        'component_rdx1cz59w0aqten42rg574ey57fj92xutj50ydus9gv66cc0rmgqk250al',
      token_x: Assets.Fungible.DINO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nga3f6h9t8l3dp7n95ml9t3lslr4fqexvhrr8cy6kkxw3h6c80ltka',
    },
    CHUG_XRD: {
      name: 'chug/xrd',
      componentAddress:
        'component_rdx1cqjxuw3cn5hzuyte3z0q3jqjtdas7umaylgv8gy7l3ysrkes390kfk',
      token_x: Assets.Fungible.CHUG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nteyy0aaxwwzv3nhaclfvfj6vu2awdmfvc5pgeryje28l8z45g5e3r',
    },
    MRD_XRD: {
      name: 'mrd/xrd',
      componentAddress:
        'component_rdx1cr967tufdmtnayllyujths75zhxne8pdq7jgucp0j50lhpydr58wtc',
      token_x: Assets.Fungible.MRD,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf37r6c7lqe98s922vcdg55y72ak9sp8edaguzgu0yvl33vujtg0v5',
    },
    WEFT_XRD: {
      name: 'weft/xrd',
      componentAddress:
        'component_rdx1cpmat4yyj4g4kr3c530rjvyt949vrt4tr9wzhgtv7jcktjkqdnck9u',
      token_x: Assets.Fungible.WEFT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfsgk40qapte33dtfelsqste947akp09juncmn6j0x7g5qtht8lmkq',
    },
    RDV_XRD: {
      name: 'rdv/xrd',
      componentAddress:
        'component_rdx1cq5zx9ddn0xurgvrgt2qz48u6tpeztnkka3mnsfdxysredkehu4aux',
      token_x: Assets.Fungible.RDV,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfx8smksjjj9psn39d33d6rhwcaunax63g0gmh653382cqp48fq2zl',
    },
    IDA_XRD_2: {
      name: 'ida/xrd',
      componentAddress:
        'component_rdx1czsd83vcw4p3nd72dzvx9cspjm8mu5jxtts80jj9et26dj5jpefh4e',
      token_x: Assets.Fungible.IDA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngmuw64x99za62pax8gs0am6amq7pavjvz2vakdx4hdcd6sqesyp7d',
    },
    WOWO_XRD_2: {
      name: 'wowo/xrd',
      componentAddress:
        'component_rdx1crdl77vtvllddtut3u4ezjaztc6u7dfke2sv5syhmsdhn63uju3qfu',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n27d97lwfk6d4c6re36d6ky40xffzvyw3jdhgz35vs7surqdhgstjt',
    },
    WOWO_IDA: {
      name: 'wowo/ida',
      componentAddress:
        'component_rdx1cz70hr3m5cyq5zq6ya793qxhg04vsssd4qupln96xayq4kcpucsh9k',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1ntvvt2cs965ye8yu069m7nmf0qlxall58uy6zx4y57lkfj86g9pufp',
    },
    WOWO_IDA_2: {
      name: 'wowo/ida',
      componentAddress:
        'component_rdx1cq0tqfugk5k60nwz28ej790flu6jsy96t8tuwn4g4wpaskg6uxqkp6',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1nfqs0m7s3wckse0ffdkrc2jkyy2f0x0plh3sffshqtmwjl4y0kf68f',
    },
    BOX_XRD: {
      name: 'box/xrd',
      componentAddress:
        'component_rdx1cqppz4r4h0q0cmzvw0jwz5kgmzxwajzm6y8quwq2d9qd05tz9kz0nk',
      token_x: Assets.Fungible.BOX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntdpm4557xqstv2ghjspvsyklaffr4ct7nrrlth393yckewxgdy8af',
    },
    WBTC_XRD: {
      name: 'wbtc/xrd',
      componentAddress:
        'component_rdx1cp969allhgfwgx3wplawvanfzmcl4z6xg05pr4cexhwpjqs7epuawd',
      token_x: Assets.Fungible.WBTC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2pfxwf44ggytj7zdvuraywwzeaahpnkzhaclspdye33rjp8gfhzhh',
    },
    JIT_WOWO: {
      name: 'jit/wowo',
      componentAddress:
        'component_rdx1cqmxnzye0vumchae9cwyhh38vczvykrvkljusqlq7zt8np34l076l4',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.WOWO,
      liquidity_receipt:
        'resource_rdx1ntjlw28zpeg5ajmket7u7aksy0guvqqpgljwsfvjsdmaxyewcpr2d6',
    },
    DAN_XRD: {
      name: 'dan/xrd',
      componentAddress:
        'component_rdx1cqulqdz5pjdd4mma9fpm57g95lmw2cr5wwx7van32l8w88ekql4zzd',
      token_x: Assets.Fungible.DAN,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2wlhjzquwqdc2lc7ktaekzn5jskdcac3xmk8v9lp263u23lkxce98',
    },
    JIT_EARLY: {
      name: 'jit/early',
      componentAddress:
        'component_rdx1cryxv0jyk62hcyz0v6vnv8755wgaamsy5n9u457np76lchxn6ze383',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.EARLY,
      liquidity_receipt:
        'resource_rdx1ntege3gq20sgu63hlu6egyw9z3pvvqhrjt9lpgwmqvepu5aj936wyk',
    },
    NEARLY_XRD: {
      name: 'nearly/xrd',
      componentAddress:
        'component_rdx1cpx482h4cat4pm7qf0dgqv4rg2zsfjsr60hkrjn3uaul0h6gth8kxl',
      token_x: Assets.Fungible.NEARLY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngxrvz3selkt4w8zn2q27c6qgjxxffnlwlktnfuzmcexlqz7w2yfax',
    },
    XPEPE_XRD: {
      name: 'xpepe/xrd',
      componentAddress:
        'component_rdx1cz66rt4pjtrq8k5fz4ly2v7ggvays5p3ytw97kwds3hq5tnpwlv4pl',
      token_x: Assets.Fungible.XPEPE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng3ammm9xmvu56emsp5dc6k4qrqhdj9rmd8let50k6yc6lhzjh0yze',
    },
    XXRP_XRD: {
      name: 'xxrp/xrd',
      componentAddress:
        'component_rdx1cq6fg6lu5m9xa9yc3y0sc2zxpte480cangch0dhgf98xzppalhk9cw',
      token_x: Assets.Fungible.XXRP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntt30jee3al8waaek98qj5p7uc9yy5x9saha9auknj8w76gx8y0kth',
    },
    BANANA_XRD: {
      name: 'banana/xrd',
      componentAddress:
        'component_rdx1crjn2csrrxstchmk5m484dv07vcekr5pnmrfdsee9l8w7trdu9fmht',
      token_x: Assets.Fungible.BANANA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngx6g5wwm47vzr73752hde0axxs686s3k8j802236hdf4d3f04n68p',
    },
    XCRO_XRD: {
      name: 'xcro/xrd',
      componentAddress:
        'component_rdx1cz43fxme99up894vcuctkp74whej7pq0yrzn3fd8kpg7580xddn8h5',
      token_x: Assets.Fungible.XCRO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntcxeeyyulfs0enp5fec9utp7dzswyf95aqp5jt8aujx090sd8aeyr',
    },
    XAAVE_XRD: {
      name: 'xaave/xrd',
      componentAddress:
        'component_rdx1cqg4uwv7h2tdfwdemvdfh8wx7dlrcyjx3e4chqea2zksh7wkkhwn49',
      token_x: Assets.Fungible.XAAVE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngvz7tsag0j2fr8qe2hrqcwxyherny606qaw88lyyw6ll6n9juvc4f',
    },
    XUNI_XRD: {
      name: 'xuni/xrd',
      componentAddress:
        'component_rdx1cz3jkdp5y70j54qgk2refapt8fkg7h47x2hvdwvrwkh8r24nlzhq4w',
      token_x: Assets.Fungible.XUNI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfwvcm5s44feu83d4z952p69fynhtx8le3602s24af2fu3mswt86q9',
    },
    XRD_XDAI: {
      name: 'xrd/xdai',
      componentAddress:
        'component_rdx1cqak47gqstqgt48fpk9kye4789w2tc6ll3tmcjvfku02r2j7th8wsq',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.XDAI,
      liquidity_receipt:
        'resource_rdx1n2d5zalplpaey44l2qz7gft3wv3zfvc29ufktlrn37tkzccn0uvjl3',
    },
    WEFT_DFP2: {
      name: 'weft/dfp2',
      componentAddress:
        'component_rdx1czpdc0s5cn3a9un02sm4fkzt936xcr2tjyph0czeqp45xtw9d2aylu',
      token_x: Assets.Fungible.WEFT,
      token_y: Assets.Fungible.DFP2,
      liquidity_receipt:
        'resource_rdx1ntmtap6g5lmttw0eakuarahgnxcw8chvsxl2ellqqemghgfk8chh09',
    },
    XRD_FUSD: {
      name: 'xrd/fusd',
      componentAddress:
        'component_rdx1cqgxcw4hzekzlajt2kuwnvh0n52fa2xuqljjfc3szcjp7wxjafn45y',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.FUSD,
      liquidity_receipt:
        'resource_rdx1nt69899zs7p6wmmye3dygpyeqed3k94x4v2ccgh7rxg37003tw9nu3',
    },
    GIFT_HUG: {
      name: 'gift/hug',
      componentAddress:
        'component_rdx1cpvnt7lvv2zazpy846sa7d2rwx8e6wywf6c7wmnelnhxc7dq5re3ds',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.HUG,
      liquidity_receipt:
        'resource_rdx1ntzpm4rpe9an6y2dz3fkuhvfht89q7068acfflty2yhg82wh63sm2j',
    },
    GIFT_FLOOP: {
      name: 'gift/floop',
      componentAddress:
        'component_rdx1cpwcnxv2afdk9v0jg56y3uqekqay0gjq42fpzggvn8axw9wnjr2q0m',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.FLOOP,
      liquidity_receipt:
        'resource_rdx1ntrx83dcm8yylz3dvlxrsmklwj3r5xl5v2w7f36rx45ftnkmhgz9wl',
    },
    XWBTC_XETH: {
      name: 'xwbtc/xeth',
      componentAddress:
        'component_rdx1cp4wcr8nznnqla0ta8s3qwqzlywzc3488wnu49wha8z0g47su8awfd',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.xETH,
      liquidity_receipt:
        'resource_rdx1ngnyumgzmsk76unhgvp3drsxk68ddslaphzfj27kzy2zev5rt5gaea',
    },
    JIT_JWLXRD: {
      name: 'jit/jwlxrd',
      componentAddress:
        'component_rdx1cp2eqgw3anye6pgudlsn4rczxnyrpznfqk3cgdayyyfj05x0vnujp3',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.JWLXRD,
      liquidity_receipt:
        'resource_rdx1n2vwxxrxvu9nn6d29hxjd2r4dwgyz2n2q86880ptu7386me9l9smvc',
    },
    JWLXRD_WOWO: {
      name: 'jwlxrd/wowo',
      componentAddress:
        'component_rdx1cpk6vlp6vkk643wan8eta6d4q332ee98saxtl7uhjfpdwyzed6uspl',
      token_x: Assets.Fungible.JWLXRD,
      token_y: Assets.Fungible.WOWO,
      liquidity_receipt:
        'resource_rdx1nt8gqv5gz7ucp8v004ru5nwvt8tvu5cyy0qzf8v8vczn8qdkezuf9t',
    },
    JWLXRD_EARLY: {
      name: 'jwlxrd/early',
      componentAddress:
        'component_rdx1crqymt5dgav8vva4smgvrqkujuphy9x4msd5w4nqs2gcezcxx7nlse',
      token_x: Assets.Fungible.JWLXRD,
      token_y: Assets.Fungible.EARLY,
      liquidity_receipt:
        'resource_rdx1nf2m69l5jhtgjqfg5t85h7mumrvwjq69ll3ase4egd40ycljel9uxk',
    },
    JWLXRD_WEFT: {
      name: 'jwlxrd/weft',
      componentAddress:
        'component_rdx1cp3nhj96kj5npp09g5s4vcsj3xtug92ndc6a8ypqn4nukrenkwumy9',
      token_x: Assets.Fungible.JWLXRD,
      token_y: Assets.Fungible.WEFT,
      liquidity_receipt:
        'resource_rdx1nfaps6wauhde9nu808vaf7g8j0dlkzmpdkzgnjr7uwn7z2eete733x',
    },
    XRD_JWLXRD: {
      name: 'xrd/jwlxrd',
      componentAddress:
        'component_rdx1czxsgutdz6em0205melq46wcf8g9ak939fzq60c5pg3hcnv2e75rff',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.JWLXRD,
      liquidity_receipt:
        'resource_rdx1ng6cx6uh3faqmx4yqrx8lzhqy6spupxrclcxvggmhsfax0j6ystjmf',
    },
    GIFT_WOWO: {
      name: 'gift/wowo',
      componentAddress:
        'component_rdx1cqdlwwaazthunhz5lzeyhnqy3rjlhuywhljrgv93zgmzu5syt503xn',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.WOWO,
      liquidity_receipt:
        'resource_rdx1ntnxwc9fpwfwqe8ek9yafdvuhjvjdujs3wgk2aehvdvn69dztxs4vs',
    },
    XWBTC_XUSDC_2: {
      name: 'xwbtc/xusdc',
      componentAddress:
        'component_rdx1cqt597jmw6grf8jdsdladwgqu8kl7hjx03332exkpfeag7h2fvf563',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ngwsr6r5meaj6mhhszpmntkkzmt7hjmx6xf6kystqx80r9vxm7lduu',
    },
    XWBTC_XUSDT: {
      name: 'xwbtc/xusdt',
      componentAddress:
        'component_rdx1czykzkd9vcu5g46rfn75kc0jz0gvw3y7trlcjyweac5z6fx5uz45s7',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.xUSDT,
      liquidity_receipt:
        'resource_rdx1nfsdlw8tvh5tr89kctsuaagwzfvm0608s8dkdzlqwtz24yfhrzxv9z',
    },
    XETH_XUSDC: {
      name: 'xeth/xusdc',
      componentAddress:
        'component_rdx1cpvngcr2xujqz2tysxsft4th00wttpluhndxuh0rcpzdwq5uzj6n6l',
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1n2t7kz5g8ses5j52g0kcp6qlwrphgy6yserxvswycyplp902eqs5ck',
    },
    XUSDT_XUSDC_2: {
      name: 'xusdt/xusdc',
      componentAddress:
        'component_rdx1czh7n0v8qs3req4la3stuuxdyhq3trn4r9hwh5jrjjmr3prexsl5sl',
      token_x: Assets.Fungible.xUSDT,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nfauthkaqw6tvmj0l0efkm5mqdtwun9qpxp68ufx3yzeaeyj75teya',
    },
    PHNX_XRD: {
      name: 'phnx/xrd',
      componentAddress:
        'component_rdx1cznl334ncqm3dl4nsnsdlreae37tnr924ajezqdxqcfnv8kk8vqzgu',
      token_x: Assets.Fungible.PHNX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf34hs9k9r07f38eyh457lugssvln49u088qhtfqmfhpdc9mxgqssp',
    },
    SLFI_XRD: {
      name: 'slfi/xrd',
      componentAddress:
        'component_rdx1czu3kns2jzqm09ry7urdk8mvh6vpc88g29gqg5afpxzfa80h29lhjk',
      token_x: Assets.Fungible.SLFI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nt3jzeedgunwshmpq75n2rfnvx795aa72pvh7kec9rq8rl2dks2srd',
    },
    RADIT_XRD_2: {
      name: 'radit/xrd',
      componentAddress:
        'component_rdx1cpdyml7dsdqsx2kmk6r4vpuq4scjcs95f85ynv6rzxukg9s5709xc0',
      token_x: Assets.Fungible.RADIT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n27w78l3ey3n984706szejny3j4jruxzu59njyglp7tgdjmgervz9s',
    },
    STAB_XUSDC: {
      name: 'stab/xusdc',
      componentAddress:
        'component_rdx1cpqcstnjnj5cpag7wc04y6t4azrfxjtr3g53jdpv4y72m0lpp8qkf4',
      token_x: Assets.Fungible.STAB,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ngt09n8lg292hnzwvz5j6hl0aexja9ggh84qyam3xk3vcala72c2um',
    },
    COS_XRD: {
      name: 'cos/xrd',
      componentAddress:
        'component_rdx1crl22ek6ff452gptx3zkjs6cktzlz3raxuln8leqmdd44a62yu84yj',
      token_x: Assets.Fungible.COS,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nt2zug5cnh94mpk3uqlqwt3wdrlpmz9h97rq2nv8tefrwa5hjl33dm',
    },
    EARLY_RUGI: {
      name: 'early/rugi',
      componentAddress:
        'component_rdx1crj58wt4zcjne4m5uw7cvj0g254zk60w9dmqhcrmv27p4atjkvdygg',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.RUGI,
      liquidity_receipt:
        'resource_rdx1n2rk9l7a5et4k4ulr3hmd2msz8cra6ppkaudv7hndpkmmcqm3kmptk',
    },
    FLOOP_RUGI: {
      name: 'floop/rugi',
      componentAddress:
        'component_rdx1czljy8gd76gwr73r628h5kd8azw8mgl7q5z5gy28flpa4xqsqe9xec',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.RUGI,
      liquidity_receipt:
        'resource_rdx1nfwnt7292e84jzq6g6uvyt5z29glurs82zg0ew5ywelwyznxmrgu2j',
    },
    EARLY_DUCKK: {
      name: 'early/duckk',
      componentAddress:
        'component_rdx1crhlz9qrpjzlmw495x94h2luawj73ju9phlphqp8wvh5jemjj8gghh',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.DUCKK,
      liquidity_receipt:
        'resource_rdx1n2tkaqmhnj3zrpycpaew35u2s4duf99xp2k29vl24vqg8p7xcq5h9g',
    },
    SPACE_FADE: {
      name: 'space/fade',
      componentAddress:
        'component_rdx1cpzc3ku63q3lwmekze9z3p7acjlj3gvdrdzmklpfmhk5vz3zq8k4sq',
      token_x: Assets.Fungible.SPACE,
      token_y: Assets.Fungible.FADE,
      liquidity_receipt:
        'resource_rdx1nf937qjpq4dsy5rqaprwp2ez6uamm9w3f28rz9tuczfmvngtnqhcal',
    },
    EARLY_RUGI_2: {
      name: 'early/rugi',
      componentAddress:
        'component_rdx1cp2vjrd07f45knhxjkknh3plnymavx0pejn7ce5mdw5q3wvqnq3j8c',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.RUGI,
      liquidity_receipt:
        'resource_rdx1n2ev4kzvgntsk3prx6ehr72cysquj75gnrl36rcqkg0fweqfhv02zj',
    },
    NRLY_XRD: {
      name: 'nrly/xrd',
      componentAddress:
        'component_rdx1czkuu4nhst7xmpcflwg9wgw9hsz62fe7dwltw4ejemvr0yvaq6c2gz',
      token_x: Assets.Fungible.NRLY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng29me8zzv5s99nlhtfxe2ew4hak7u0ckrugt0573p3nw9s69etxha',
    },
    DELAY_XRD: {
      name: 'delay/xrd',
      componentAddress:
        'component_rdx1cq4zg34v50zvecv3g47rpcajjvlxf85v94p0df0yhp9ztjs59e5nrr',
      token_x: Assets.Fungible.DELAY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngrrut5sk370y6dscavqzs7th9xcwvr3zfe3y72avernp6ukz2gmhl',
    },
    XBCH_XRD: {
      name: 'xbch/xrd',
      componentAddress:
        'component_rdx1cz2u204xsahef94umd258f2qvd9aklw5yanfs529h686ss026hwaxl',
      token_x: Assets.Fungible.XBCH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2fw6d2y5rc7vh0paqlv4ghpa7kumhy8y9hpe8w6wystpuprh33nul',
    },
    XETC_XRD: {
      name: 'xetc/xrd',
      componentAddress:
        'component_rdx1czd9rjmvhf9js8x65hrd29lej47ftt0evky0vdtq6aq8cte4lnj46f',
      token_x: Assets.Fungible.XETC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng22ftu3wfrrckf3dtngj8aahwcxk92axlckxjr5t0ysnk0c3jdysw',
    },
    XPOL_XRD: {
      name: 'xpol/xrd',
      componentAddress:
        'component_rdx1cz4jwqsnj2lyp6wp0hea9r7ckmjuhwt8zmr384srhu52zteesfkwww',
      token_x: Assets.Fungible.XPOL,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2g0j4rvj9te3larlsv7f6t23jdcn3x8fjfd4x9fndz9ll9egwttse',
    },
    ASTRL_XRD: {
      name: 'astrl/xrd',
      componentAddress:
        'component_rdx1czjn3dm0ctyr34devfmuzcs9tx5q7cukh9mlwkp34860mnj6s3uqmp',
      token_x: Assets.Fungible.ASTRL,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf4q4wggja8l20v0el44vnhvhu737hyg3eqm8dpa0dyvcnz79thejk',
    },
    PLANET_FLOOP: {
      name: 'planet/floop',
      componentAddress:
        'component_rdx1cpghj8zjpz4vx37nn2w4nn2we5xrasxp0kjrqg2ttlgwf2q0elmsz9',
      token_x: Assets.Fungible.PLANET,
      token_y: Assets.Fungible.FLOOP,
      liquidity_receipt:
        'resource_rdx1nfj08sps53qfvp9k5ce2dpxeas8m9xy37vr5hyzvuvj5fn3gpeqv66',
    },
    ADT_XRD: {
      name: 'adt/xrd',
      componentAddress:
        'component_rdx1czf5sgh8uxw02uw6hxt2v3dwtehewga92wmvghrs049jc43wa702fh',
      token_x: Assets.Fungible.ADT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngyzsjjx05prknps663tr73wmcqhegnjc8lcdd8txa7l94nfxddrvg',
    },
    ADT_XRD_2: {
      name: 'adt/xrd',
      componentAddress:
        'component_rdx1cravw3dwq2pfaa2as6zmxrke0fdx7mpyrcgs2j330g5n95sar4lsn9',
      token_x: Assets.Fungible.ADT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nge6n87kt0wjcf4cyeuttwg8gqfszq0azrgmdj4sm97gdhw0yltazl',
    },
    HETH_HWBTC_2: {
      name: 'heth/hwbtc',
      componentAddress:
        'component_rdx1cpttleyhfuyuwaaa2j3mfcvkqv9xp8m3ndyhaaty08rz37e96tuust',
      token_x: Assets.Fungible.hETH,
      token_y: Assets.Fungible.hwBTC,
      liquidity_receipt:
        'resource_rdx1ngflataergzwa9f90gkfpw26gwl36gsqfursq8pq2tvgq4qyw0afrr',
    },
    ASTRL_XRD_2: {
      name: 'astrl/xrd',
      componentAddress:
        'component_rdx1cp588g5ahlh4uurl8q95qz92v7jf9fnxhkqgfflmxk7emh6q3sgr79',
      token_x: Assets.Fungible.ASTRL,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntywx5j65z985x97shxxqtx286c0pj74p7dtuna0z7s3nlafnwplj4',
    },
    XETH_XRD_3: {
      name: 'xeth/xrd',
      componentAddress:
        'component_rdx1cz9qxmgx9w638atdn53pdxa9rldqg00s3ak5u8ts968dkr0ccdhvyy',
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngasrjd92avrjrpncl32sk4mzk6vn7hnva8tqgp77scwlvfq0kc5vm',
    },
    BURN_WEFT: {
      name: 'burn/weft',
      componentAddress:
        'component_rdx1cp5g4tsp40mnx0tnzv6498hpjdaysvfthlvk8lcjsvg6cml7srm0v0',
      token_x: Assets.Fungible.BURN,
      token_y: Assets.Fungible.WEFT,
      liquidity_receipt:
        'resource_rdx1nfwpuz7lmzfm6aqt8wn7daj2vxkm744947eglhypqk2kncrsy4tvmw',
    },
    BURN_DFP2: {
      name: 'burn/dfp2',
      componentAddress:
        'component_rdx1cqyag76srny5xe2r030mu900267x9d0rd67jmuv967xcrdhez5dspn',
      token_x: Assets.Fungible.BURN,
      token_y: Assets.Fungible.DFP2,
      liquidity_receipt:
        'resource_rdx1ngd42fc77afrk7q7mvyuxt63zvvm9052ajk05hev6w2jq82mx5cjzu',
    },
    WEFT_XRD_2: {
      name: 'weft/xrd',
      componentAddress:
        'component_rdx1czmr0nmtky4qfe7sn7dke6nxl4fs3pnp3wmre92cvaz06eyvwmv42y',
      token_x: Assets.Fungible.WEFT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfcwq8uaxmdnlkejym4fd0p8jl6u0d4y98ywxu53c2jcczcr0sw4zn',
    },
    OCI_DFP2: {
      name: 'oci/dfp2',
      componentAddress:
        'component_rdx1cr9kjxkj670vyydd8q9s0gjwk57svtjv986xuetdg79l292g6n8ua5',
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.DFP2,
      liquidity_receipt:
        'resource_rdx1ntxtk8phme5k4xpkte2zpcgves9hxcpg9y3gla9xp66p4kkgvch2km',
    },
    XRD_XUSDC_2: {
      name: 'xrd/xusdc',
      componentAddress:
        'component_rdx1czg0xynqq0kgfh9n4lpjtw2dtjxczdregez8vtwht6x3h0v9jzxg70',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1n25fwgxt62ksnvmu3enjap96tn0alnwdwatfhv2pgsrwj045a8wcr8',
    },
    ROBO_XRD: {
      name: 'robo/xrd',
      componentAddress:
        'component_rdx1cqcdxz4z56d3cee98skf3uhw2pzugusjsd6cg0w2wymlxd2zuaj96d',
      token_x: Assets.Fungible.ROBO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2nz280plww9keahxxysx5rdjwr7m3whaj0fseqpzarulxdqd4dx89',
    },
    RWA_XRD: {
      name: 'rwa/xrd',
      componentAddress:
        'component_rdx1cp7kd3s44lm3vh2ylq7ven4yavjl3clpx7hrws3acy97jlk5dm5u6p',
      token_x: Assets.Fungible.RWA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2jv2z0geq9p8twramknnrzeyg4fc6n02lkf8yqyj8t69z9j6nq05m',
    },
    GAB_XRD_4: {
      name: 'gab/xrd',
      componentAddress:
        'component_rdx1cqn590s2c4jknklkl4gmtcsdy5tkd05wj0880zyhsfecq3gdcztvre',
      token_x: Assets.Fungible.GAB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n25j4qu9wxc0fkcmtyedt3kx4nft84gqcynz6wl6g7azzentp4zxn4',
    },
    GAB_XRD_5: {
      name: 'gab/xrd',
      componentAddress:
        'component_rdx1cp0fhg2tg5y7qvvseparsshj2xvr5703kgvdzfdqu6xldsz56r8rd7',
      token_x: Assets.Fungible.GAB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2d86d3yp9ytzmlzv6sl7cj6czy4ewnzrl5daehyuj2dzd05xqyjl9',
    },
    NOTBTC_NOTXRD_4: {
      name: 'notbtc/notxrd',
      componentAddress:
        'component_rdx1crx32l52mep7j7jyljv2j9nfp983yakvm6qcydc7zwrp7tzlxdfkvk',
      token_x: Assets.Fungible.NOTBTC,
      token_y: Assets.Fungible.NOTXRD,
      liquidity_receipt:
        'resource_rdx1ntly4k69lja5uyzrmudu4agcenv6qxuft6ajea4hk4690h7lrfpp9r',
    },
    HHUG_XRD: {
      name: 'hhug/xrd',
      componentAddress:
        'component_rdx1cqrql3tyqwahu5vnae2t4kshqp7e5mtlq9vhqtd7qmw98p9q0r2e4v',
      token_x: Assets.Fungible.HHUG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfjnd3n67ap3ln4fekka5zql0vsfqdwd9lp6etue8cn7tech6h2mxf',
    },
    PUMP_XRD: {
      name: 'pump/xrd',
      componentAddress:
        'component_rdx1crxp6e4f9vysqgql3zygeq0vvkchtfdypwq382fjz557suxdpkk5u8',
      token_x: Assets.Fungible.PUMP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntfhxelhyfrd47hywx2p589umzj23xrsls4cfwss0zkqplggx7qy3j',
    },
    CTB_XRD: {
      name: 'ctb/xrd',
      componentAddress:
        'component_rdx1cq5059r6xyhfp02d5vwz2m579dfy8rzxy07p9rk4902m0u325g8lmd',
      token_x: Assets.Fungible.CTB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfplvly5244nuyevj9skplgagu99aecj03lyuehl0jwt5ngs7ycssz',
    },
    BOBBY_XRD: {
      name: 'bobby/xrd',
      componentAddress:
        'component_rdx1cqzzqp62put64cxrhscjjkuzzv84yfm4ypczfpsy34wuejj0p0kmnh',
      token_x: Assets.Fungible.BOBBY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng40uynq5qg934yuj679emgkg9ny6eg8w8dnzm6knqusuvws7gtz4w',
    },
    XWBTC_WBTC: {
      name: 'xwbtc/wbtc',
      componentAddress:
        'component_rdx1cq79a2qqfhlz66s9a7c5dv8rsv7qf87yx30aj9qcvtv0m74mysp2nk',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.WBTC,
      liquidity_receipt:
        'resource_rdx1ngs2p5maupxud2mgw02nrf2l20yv2hfx9xwm7n36uuudrhz3twyl3p',
    },
    XUSDC_UID: {
      name: 'xusdc/uid',
      componentAddress:
        'component_rdx1cr3guhjqmaqckfw4rgygz3m800glxnlyxq2vvvldq76003mus5kp24',
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.UID,
      liquidity_receipt:
        'resource_rdx1ngf448hlaeztryuuz3anpulpjummtj2267vhqmftkj4tqqp97jqjdd',
    },
    CAVIAR_XRD_3: {
      name: 'caviar/xrd',
      componentAddress:
        'component_rdx1cqf8th0ej427vdn5z46n879vpxp05j68z667r69zp4xazguxdc066z',
      token_x: Assets.Fungible.CAVIAR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n25g5lzu68d4hs64axy3nj5nh5alxkqgakqtawde6xk7epz76fam8g',
    },
    HODL_XRD_2: {
      name: 'hodl/xrd',
      componentAddress:
        'component_rdx1crzantdmcdqxegd9cjfayp0lka4gx7k7d9m2aag3jskc0mrj0npy9p',
      token_x: Assets.Fungible.HODL,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2zd64zkk2h6tvkq8juujefeu73rm705w5n0hfrfe05y96ema3jjyl',
    },
    CAVIAR_XRD_4: {
      name: 'caviar/xrd',
      componentAddress:
        'component_rdx1cq756st3fcpktdtks4rfldj8s2p7gzzsq869xz8fadvvj7m9tqwgcf',
      token_x: Assets.Fungible.CAVIAR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2sqnnhjpk7dpdgjktggk4hpw0gw3xfk0qrgwvq4942unwyshqgxnw',
    },
    DEXTR_XRD: {
      name: 'dextr/xrd',
      componentAddress:
        'component_rdx1czewnqspuev6fkcjg24k2g4zcxhjc7e0y2jnwxuljp48yhe8zchskp',
      token_x: Assets.Fungible.DEXTR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntfevk5yhtm6td3lewau076z4x4fkyu50lug4supklp0e9qmn9tyaf',
    },
    SIN_XRD: {
      name: 'sin/xrd',
      componentAddress:
        'component_rdx1cra5sd49522z90pc02mfa84ah6q4d5huy8edfzgprj4cn5yw9m94ds',
      token_x: Assets.Fungible.SIN,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngqw7knazagp5gm4yfdmn09ggtx83zr7n7wx036vyrhnj0rl6kyavt',
    },
    SIN_XRD_2: {
      name: 'sin/xrd',
      componentAddress:
        'component_rdx1cqh39gv0zfm9utz3dg69e9rrc0mvyygtyhx6wadsl7k7nl832nthgz',
      token_x: Assets.Fungible.SIN,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf9j7tqrp03ywv2re2jy95pj6m3l3fasa8v5q9ku0c0ypadcycl2vg',
    },
    ICE_XRD: {
      name: 'ice/xrd',
      componentAddress:
        'component_rdx1cpd6a2uctfve72eekl34dwsuafslmvtu6ndg9x7g0d2mk8untyjvhm',
      token_x: Assets.Fungible.ICE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2wnmhj8fs3kewaqprl93fq09l5c6ucxhq0kf92gj5ll43svnxz4vt',
    },
    IDA_XRD_3: {
      name: 'ida/xrd',
      componentAddress:
        'component_rdx1cql4kz86sg7daltrhlnw2jvdqv6sm00ygh7rwj493s4ynydjwrjfh5',
      token_x: Assets.Fungible.IDA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng8t9cylms6xkev80wdsewgsvxu0zkcv4r4255aafwq4vvd9melvt4',
    },
    BLSS_XUSDC_2: {
      name: 'blss/xusdc',
      componentAddress:
        'component_rdx1cqvmfe3wnkxunmx5djx3px8xf25qhsdxgn6x4afsrtpm2ff49aq65g',
      token_x: Assets.Fungible.BLSS,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ntyuvmvcg8l5zxrwk3u6wuhqghsysc4nh5rek5d0dfj2jqsq604jhh',
    },
    SHINE_XRD: {
      name: 'shine/xrd',
      componentAddress:
        'component_rdx1cz57ley8c2nn2u9md7hz5xpr7gasqhuh5ja75wpd2yxcsw7rs3afae',
      token_x: Assets.Fungible.SHINE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nt6fnwx9mquwr409c3cwgtzvy0pmctc56eyh6u5c9tgrf5qpgv046l',
    },
    EGG_XRD: {
      name: 'egg/xrd',
      componentAddress:
        'component_rdx1crrtkvg6q6day62ttpzuphwzmx39ezt8e6vjnpyq9e45p83med7lzy',
      token_x: Assets.Fungible.EGG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfwtqgnfvq92n7ts2dyqwd55388hhnnjuc8ustfgf50zhxfg5wm09m',
    },
    NOW_XRD_2: {
      name: 'now/xrd',
      componentAddress:
        'component_rdx1cpnwvgjgneu0wmuy26y2syllwdnl0csdd7tqmr4mrc9v0w0s05hnnj',
      token_x: Assets.Fungible.NOW,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngpsvekg6laas6gxrepxrhwy4sh9lcerdmc7sufx3u4pm7zkjv37j4',
    },
    HNY_XRD: {
      name: 'hny/xrd',
      componentAddress:
        'component_rdx1cznmvgq63dhdxv7y6gnnq0jg7q55t5w0ahk3z5wklmfzryvkp4w88z',
      token_x: Assets.Fungible.HNY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfuuphd8hsjm0v78qd87nm5fhmts2fl75h3vwzpcxlxh06qlqrn6tj',
    },
    TAY_XRD: {
      name: 'tay/xrd',
      componentAddress:
        'component_rdx1cp5ay4w4gpkhcsn4e7l9e2svkyv8y4dr4x39dgt08gyxqlj7h7dpad',
      token_x: Assets.Fungible.TAY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngpwg2ejsfusc7g89fc6gph4uwru7mr7e7l6hjgwunvp3ls3n2cf50',
    },
    CAVIAR_OCI: {
      name: 'caviar/oci',
      componentAddress:
        'component_rdx1czyhdstyky70veamh2mtk7tgcmxp4062zgxha6ltlyzw6xe7fnwnmd',
      token_x: Assets.Fungible.CAVIAR,
      token_y: Assets.Fungible.OCI,
      liquidity_receipt:
        'resource_rdx1nfhz7eqy3mj45fuv7frlxahtlld6pqxpvhmn96xpflf0ezh82nptwq',
    },
    SINX_XRD: {
      name: 'sinx/xrd',
      componentAddress:
        'component_rdx1cqy8hw4xlve6aeg85gg8wxalqxam76zm5p42nvvg94w4j5mra3naw2',
      token_x: Assets.Fungible.SINX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng9zltw7xqvrs7lxjqny0f3cfkyv0nza7n7hq9dxxka6r38gxuwnqw',
    },
    RWA_XRD_2: {
      name: 'rwa/xrd',
      componentAddress:
        'component_rdx1cqy4zgt6uc2ah6r8l2dq3r90ptf0wk2sj8mnzwwq4wd9ez4s3lpenv',
      token_x: Assets.Fungible.RWA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngmxrz3pnqcr3x2w6ezvh6qydsnsknwura066q8c0eaylmtrsexvu0',
    },
    IDA_XRD_4: {
      name: 'ida/xrd',
      componentAddress:
        'component_rdx1cqg95y2z7pt4s30u92v72m4na372maq7m45swf89cful7a097ae9g3',
      token_x: Assets.Fungible.IDA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2t2ju6feg0svphmtqwtesy9sxuv3jmzfwmfgazzue97mhqa8wyx99',
    },
    XRD_MRD: {
      name: 'xrd/mrd',
      componentAddress:
        'component_rdx1czfw0cfjaee3e3a548xdyndxe3rpjvlsaw772ypllkjnvd2w6k539d',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.MRD,
      liquidity_receipt:
        'resource_rdx1n24zrswrnnzrmt7g6z009kw0mnl8ux7zfmcdf93g2tfh5k46s4xjjd',
    },
    DOGE_XRD: {
      name: 'doge/xrd',
      componentAddress:
        'component_rdx1crqz4f398dpzffpulkgvlxlxzwavav9lyg8e75vpqtq09f4lq04hfj',
      token_x: Assets.Fungible.DOGE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n25qylfmhazzd8ed27vn49fe78lmdk7ggw2k05qlchfee0vzlefy8q',
    },
    FLOOP_XRD_3: {
      name: 'floop/xrd',
      componentAddress:
        'component_rdx1czpx293uae2m00arlwakrlhu7hsazsyq3u4v0t6j256lnza57qvlyh',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf242ge95f9552rtkz2enlu0g5pum55qmddlevufs8lshhlhyq3vv9',
    },
    EARLY_IDA: {
      name: 'early/ida',
      componentAddress:
        'component_rdx1cq0vgpe3605wf0025fc8dz520amrew0zlrtxu63ndj9wrrx9j740yp',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1n2laa0cd68p34awm7tu6m3078e0du8fn8eak3as39vlspswf67zw8w',
    },
    DFP2_IDA: {
      name: 'dfp2/ida',
      componentAddress:
        'component_rdx1crrhgf500u6w3rcu9660njgyvalmprk9dh0qzq3nh7898z32hlj6ej',
      token_x: Assets.Fungible.DFP2,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1n25f3kftqhny46hy7fj9xk5mkharlcdwg2thgnhq9vk2zslj72k7cx',
    },
    HUG_IDA: {
      name: 'hug/ida',
      componentAddress:
        'component_rdx1cpzf8mfpqjyw75a2lene3sj5g9k4292wg4gk33d42fre3q79sjvs7t',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1nfuj3gdr2wslhzy7n4x2t37kttvtnxvmmk6zgyljg4v84yk727t5p8',
    },
    EARLY_IDA_2: {
      name: 'early/ida',
      componentAddress:
        'component_rdx1cq99k3qhlldgjp2flyfmhyc8f495zwvfpehg2qrh767umew2yw953s',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1n2edsnnwa94q6cnegz978wgtqznqvksndg8c95f2n8v7jj30dzevrf',
    },
    OCI_XRD_3: {
      name: 'oci/xrd',
      componentAddress:
        'component_rdx1cr436d2nlj83zr0dufrypvmzy9xazncj75a6qwzm38qwzw8v9n096x',
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfup952cam3qt64nlqqgljpu6w5txzvg56fl7rqu0veupn6czaphtp',
    },
    FLOOP_EARLY: {
      name: 'floop/early',
      componentAddress:
        'component_rdx1czqqddt8va9jzzvvkwu8nx327ngjeg23266rdw08wpl5qtldd22vsj',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.EARLY,
      liquidity_receipt:
        'resource_rdx1nfujjda3xs3trt82qcxjcj67j5h79gjvsaumqs0nq7zhuh483jraz2',
    },
    STUFT_XRD: {
      name: 'stuft/xrd',
      componentAddress:
        'component_rdx1cqptm5wxaepcszmsxljp0vq4sxl733mz44petcwg44thx54647664w',
      token_x: Assets.Fungible.STUFT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nga3gdnwx6r72alkz7gwcnxa2x2x00qyls8uy2z3c6p2uqkfqz8a4x',
    },
    MOC_XRD: {
      name: 'moc/xrd',
      componentAddress:
        'component_rdx1crc7an8xyrjd80mglq97fqys7h5e0mpxty8m8u3hxqhvp89yyae593',
      token_x: Assets.Fungible.MOC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfgj28z8gymrz23ctauy9hwjr3y5tqt4k47akva7j0mtm49skev76g',
    },
    GNRD_XRD: {
      name: 'gnrd/xrd',
      componentAddress:
        'component_rdx1crkh9fy274zzn2d6fkyrm5ts3tsthhp8pl0eppv4m2td2zehqwq569',
      token_x: Assets.Fungible.GNRD,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngmepfpqmlw88ja32dtnwgmlxl9wvhq2ujghdrp4th0knt6ku0h56n',
    },
    PHNX_XRD_2: {
      name: 'phnx/xrd',
      componentAddress:
        'component_rdx1cpaz9h7wl5uy0pqmpmufxnu48v7nrvwxpqqsdw7f2kncwkwh50zd2r',
      token_x: Assets.Fungible.PHNX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfyuzr2cycy4urnw7r78uwlqnc097qcldz70qwg9j4csluessqtl5w',
    },
    HUG_XUSDC: {
      name: 'hug/xusdc',
      componentAddress:
        'component_rdx1cq7xc8ex26sm9j5smw6ju4gzjt0d2rdtuxt4tk7jwk8uxdhj5gvsjl',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ng78klaefx2q5n2peejhq38r4ax6lrqelxdlln96auxydllys8pvg4',
    },
    JIT_HUG: {
      name: 'jit/hug',
      componentAddress:
        'component_rdx1cr3u8ncq362fdanywq5q0caweeg69seqq2zc80mgl4l7hwndqm0suv',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.HUG,
      liquidity_receipt:
        'resource_rdx1n2346d7ruch7mru06lvr46fwyt54tyu0084am0mh00qr70zerg88nl',
    },
    XRD_CAVIAR_2: {
      name: 'xrd/caviar',
      componentAddress:
        'component_rdx1cpr5gv9727lew4kvtnrjdt9qzjvta4ssq00pleht5rdszuwcy3f3h5',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1nft6l8uj2lj9tftw7hcpf06ey9vvhzckhvwht342wpw069sv70cy38',
    },
    XGRT_XRD: {
      name: 'xgrt/xrd',
      componentAddress:
        'component_rdx1crqqau0a5hfh48z9zlqgqejmtkz8a0jgfacqndmdveqqzpqvxnjzpm',
      token_x: Assets.Fungible.XGRT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2e33x963y37nz4at2w636tp4807stek5pe03zvmjlddumtugkk7rt',
    },
    XIMX_XRD: {
      name: 'ximx/xrd',
      componentAddress:
        'component_rdx1cqkhhxlm2mhrmyp7wm79e6j2chj36dmzk9p3g3ap3y8r4r5pzp04kr',
      token_x: Assets.Fungible.XIMX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng25ec6sxurl0qmp0363ktkpd8pu3j56952xqnq020sxqa273scctp',
    },
    XENA_XRD: {
      name: 'xena/xrd',
      componentAddress:
        'component_rdx1cr8mh7gelnenvatwqhn6wffczqjn4zryewf204dnat8d8mlpparj03',
      token_x: Assets.Fungible.XENA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n29vj57xw94ac2k5lwt6juds8p5s7r7d5leqrxwmtx9sg88d9veeyj',
    },
    JIT_DELAY: {
      name: 'jit/delay',
      componentAddress:
        'component_rdx1cr4d5c7hqlu0yyrqs0dpsxt5kyftnlm4htmy77sgs94a007gkphece',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.DELAY,
      liquidity_receipt:
        'resource_rdx1n2fdy4gjau23cc6fscnx3l7jx9a29tcwqzu2schcrnqd9qjx9mz9fr',
    },
    XDAI_XRD: {
      name: 'xdai/xrd',
      componentAddress:
        'component_rdx1cr4dqpe64ghptw6fh5wxczhrsaa690vm8unype7er0xvlusffp6syv',
      token_x: Assets.Fungible.XDAI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntx68sqgy2lyyjt2s9tt4ua2u02lp445le7dx3l2v2xadwpavh7dy0',
    },
    JIT_MOX: {
      name: 'jit/mox',
      componentAddress:
        'component_rdx1cp807pnlnt8anx82qhqvp7guufjz9f9qw3a77eg46ag2hk89krrkmy',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.MOX,
      liquidity_receipt:
        'resource_rdx1ntzy05ayvqustnx8pjvu0fanfa3yqmzkd5ej25pq8q8thtjma92hyq',
    },
    GIFT_DFP2: {
      name: 'gift/dfp2',
      componentAddress:
        'component_rdx1crrnxryqazajzmdxaaf9tz3g7hcs4djwx04hqkejjtclvpc7m7exma',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.DFP2,
      liquidity_receipt:
        'resource_rdx1nt6mw4wvk6ljeg7qgv2tkw2akapcyx39ppv7wp25fjjkzkg0xk4s40',
    },
    LSULP_GIFT: {
      name: 'lsulp/gift',
      componentAddress:
        'component_rdx1czh5lh3e4cs7z3wnyew0puxpnexnnejruu9qmxlw3jeuj80rhdx67g',
      token_x: Assets.Fungible.LSULP,
      token_y: Assets.Fungible.GIFT,
      liquidity_receipt:
        'resource_rdx1n2499ddwnvyvmfj0ppac6qpzxk7vuq4uyqr264l9uh8zsm0l7y3qq2',
    },
    JIT_CAVIAR: {
      name: 'jit/caviar',
      componentAddress:
        'component_rdx1cqn6qeww2q7tzlselq6ww29afscrs656tuveehfyxzlu3kz5dq83ks',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1nge0usmcznjrpajanpgla0zat4fm2ptrajwltejx77lwtl5ary5nrv',
    },
    JIT_WEFT: {
      name: 'jit/weft',
      componentAddress:
        'component_rdx1crkx4hmm5lu82ywml0q43qzaxx7kgc3u8evvnzvzsd4ss52d2pljw0',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.WEFT,
      liquidity_receipt:
        'resource_rdx1ntgtash3v5j3d40w584ugjjfvz3u3ctvdm5kerrerxkr0hmh3h6wmq',
    },
    XRD_JWLXRD_2: {
      name: 'xrd/jwlxrd',
      componentAddress:
        'component_rdx1czjw5tvd57xpl8kmej6j5uzkr00gym7jfy8lrgxhvwwazjulvlvwy5',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.JWLXRD,
      liquidity_receipt:
        'resource_rdx1ng7tz5xgkf3w33jw59wazq37uyu3wsgn8xfl3wz6j9yq7wnw9rw2ft',
    },
    LSULP_JWLXRD: {
      name: 'lsulp/jwlxrd',
      componentAddress:
        'component_rdx1cpaw7qf76mxhm6jj0jdntwscs078gpymaqfn7apmzeave3lnt3u62j',
      token_x: Assets.Fungible.LSULP,
      token_y: Assets.Fungible.JWLXRD,
      liquidity_receipt:
        'resource_rdx1ng9seyfqpsfgkt4gtwgk6eqdl4kc6vp3nxdswj4ava0jt5kw2rwpc8',
    },
    GIFT_XRD: {
      name: 'gift/xrd',
      componentAddress:
        'component_rdx1czpmldt3c08u0vc7mjwmtrcy2ev09cp3veslnan5n8m99s4hxh8rfn',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngdzfqss7s0vrzf7hvp8ajxug5d3s6clzna4tlzcqwxuhsmvuudruj',
    },
    JIT_GIFT: {
      name: 'jit/gift',
      componentAddress:
        'component_rdx1cp2uskmkh8jwtqgjx9eeskws9am50ydd8eptzenkp2ufr67a9kg43r',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.GIFT,
      liquidity_receipt:
        'resource_rdx1ntgv02gnhpcuvty8r0qv03sa4evenr6fadu2rx3j9vjmmzszp3nfev',
    },
    GIFT_DFP2_2: {
      name: 'gift/dfp2',
      componentAddress:
        'component_rdx1czmjwg56ly3uxvxsxum6zppk5xq4q8hsy8rfaf32z87v4he8kxzugj',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.DFP2,
      liquidity_receipt:
        'resource_rdx1ngyhppqr2vl4kumrksqj3hryk38c802f56q4ya8upm3sgyzt7htvr7',
    },
    STAB_XUSDT: {
      name: 'stab/xusdt',
      componentAddress:
        'component_rdx1cpcvn5gfarkhm7u3lks78shayph0dg3yv74ghngq7640jrj70m6aqt',
      token_x: Assets.Fungible.STAB,
      token_y: Assets.Fungible.xUSDT,
      liquidity_receipt:
        'resource_rdx1ntt4ufxgehc835at8ncphvfrrjtfyq8rn2nlkfzmp7zjyskr4uu7gd',
    },
    ILIS_XRD: {
      name: 'ilis/xrd',
      componentAddress:
        'component_rdx1cp8xuxwvv7kdg6074yffqhkg6lw6eks6v87hcwyskrcqm62m2l7rvg',
      token_x: Assets.Fungible.ILIS,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntsxl406xd88uf2pr6mtzw8erjtpkks496hkll440qdfq74j4lmxxg',
    },
    FOMO_XRD: {
      name: 'fomo/xrd',
      componentAddress:
        'component_rdx1cz89ve362k5qwcpk8nhhud3wtx690cr9n74llmtj68k9cax40d9vj4',
      token_x: Assets.Fungible.FOMO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nt8l4dlz6ha0an0qauj85uc6lzsgnddahs2annvvj6594u9pnfj4w3',
    },
    YOMM_XRD: {
      name: 'yomm/xrd',
      componentAddress:
        'component_rdx1cpvj30ssvxj5euyhqd5h2vm6uzka9h9pkgteuzswkwvpw5sfusak9h',
      token_x: Assets.Fungible.YOMM,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2mymh0k0nas2ge44gzqzge4wlvpqdvcrjguqgucv3u04zmn3d7av8',
    },
    XSE_XRD: {
      name: 'xse/xrd',
      componentAddress:
        'component_rdx1cz5y7yexky2gqc0zashya7jvd00sv80p4uf09ajlcqhx544c597gvh',
      token_x: Assets.Fungible.XSE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngg539jklajft0uv3hhkyk0uewvktuyal6f86fssxc6xt2crh0kw9v',
    },
    HIT_XRD: {
      name: 'hit/xrd',
      componentAddress:
        'component_rdx1crws3fdrj5smayryh8n9z8wakqppmjty8ax64echn3sqnmjqef9ccl',
      token_x: Assets.Fungible.HIT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfkkd2lfdnj87ysrddmnw6jqxe2pffc7v458gqcww6jxlllzc0syzc',
    },
    FUSD_XUSDC: {
      name: 'fusd/xusdc',
      componentAddress:
        'component_rdx1cpuxgwduz2q8mjl3mpdvwpfflvfy583fzz5hl99xqtxn8h4u62kasn',
      token_x: Assets.Fungible.FUSD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nt4ex3t5r6twh7mqsm4d5a4ze7mp92qx8qgestz2cqye5jglkpusjt',
    },
    LSULP_XUSDC: {
      name: 'lsulp/xusdc',
      componentAddress:
        'component_rdx1cqyjvtvzxw3srs02hgwcld9mhypc24rct0dnunxk6frnjhcyahygm9',
      token_x: Assets.Fungible.LSULP,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nt3dugav83jnkruxvsnz89c9pv6y637qattupgxeksxweef6z3jzxf',
    },
    PLANET_FLOOP_2: {
      name: 'planet/floop',
      componentAddress:
        'component_rdx1cze8dv5tvxwhp7hm9jt4tgwe2cqwnena0lznezha05egeq06v0vxs5',
      token_x: Assets.Fungible.PLANET,
      token_y: Assets.Fungible.FLOOP,
      liquidity_receipt:
        'resource_rdx1nghj6ppqyx9phnx5s6p9x0vsm8jjkawemrjuqrw0q72az6dfaf5pzd',
    },
    HUSDC_XRD_2: {
      name: 'husdc/xrd',
      componentAddress:
        'component_rdx1czyqmwvh2mq07w42cdqhyylk4gtxk5q2gmlwa5xz5hwjatz82wetm6',
      token_x: Assets.Fungible.hUSDC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf9207vh0dq2tgldayzcwhkk3fhf9y67gz9k02setfplnw9ptjrmn9',
    },
    HUSDT_XRD: {
      name: 'husdt/xrd',
      componentAddress:
        'component_rdx1czyptvu5ssvffvhxgn7h7ryq99xneqc7ntmx2735gd6sa29kdnqj7g',
      token_x: Assets.Fungible.hUSDT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2dh7q9hnrywr8xmw9t9mflhc7rzqvwg7dsl0y0y42c59q57jd0z6t',
    },
    HUSDT_XUSDT: {
      name: 'husdt/xusdt',
      componentAddress:
        'component_rdx1czmgyx7a4mz7j42v0fsckq40wkxvr7zshdsmn2h7usjkcwhrc76eht',
      token_x: Assets.Fungible.hUSDT,
      token_y: Assets.Fungible.xUSDT,
      liquidity_receipt:
        'resource_rdx1n2rgaw3p9lz4p7jjyykn0wtfnzy8e6nh97v4jm24qzjege5ryln69v',
    },
    GIFT_LSULP: {
      name: 'gift/lsulp',
      componentAddress:
        'component_rdx1cpg7m9kmypskg72kt5dedressvjthyj304w0372tgxdl0qwpdacae7',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.LSULP,
      liquidity_receipt:
        'resource_rdx1n2ncku47384l999xpsglv4g25pzlednju94pksmdnr9r90h4ykzylc',
    },
    GIFT_LSULP_2: {
      name: 'gift/lsulp',
      componentAddress:
        'component_rdx1crp9ps6rtnv6zwvz5cp8y2suks5grf000ulzzvmpc4z46fssvw8jud',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.LSULP,
      liquidity_receipt:
        'resource_rdx1nf4h9yvfyhqhuau74sqr0w447gtvjrwqa28shy44yhspdtnysvyuq7',
    },
    XRD_BURN: {
      name: 'xrd/burn',
      componentAddress:
        'component_rdx1cq7qgms6f6mashudcxjf6en8a9cfpqhm6ktr63zxrh72ezkcmxat5s',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.BURN,
      liquidity_receipt:
        'resource_rdx1ng7esuvkg8w3j00dm8tgsj83lg95lmxn5a80c66lgr4f2gvhyc9mvs',
    },
    BURN_FLOOP: {
      name: 'burn/floop',
      componentAddress:
        'component_rdx1cz7l9dmnu5qkj3lafct9npa60n4u495nzq0kpe8vrx939gvf2u49q8',
      token_x: Assets.Fungible.BURN,
      token_y: Assets.Fungible.FLOOP,
      liquidity_receipt:
        'resource_rdx1ngf2prhq4uex7sl7pndaemyjgrj6tf2vqjt4qhmxrkur07ghuk5ukt',
    },
    RWA_XRD_3: {
      name: 'rwa/xrd',
      componentAddress:
        'component_rdx1crpuyrlc4kvdn2e065trt6az7f7me095f2ukgcj0635ufhlm9aeqak',
      token_x: Assets.Fungible.RWA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntzqrzvy4l6va7cmeynhfc4a8k4sr05vthnh78xjkjpxta5xtxppu4',
    },
    RDK_XRD: {
      name: 'rdk/xrd',
      componentAddress:
        'component_rdx1cphnmjzvmgrukz2yn5mwfhrwf0fh9syfc2n9twnjew55h4q0eav6nq',
      token_x: Assets.Fungible.RDK,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngpf06kml4aknqytfydfwj7tl5m8vmcl4fklfpqm4xuw3def64vgxh',
    },
    XWBTC_XRD: {
      name: 'xwbtc/xrd',
      componentAddress:
        'component_rdx1czy2fsa0tex76gy8d0t0msgmyer4z7cezcgzpym7arqjhy30yjr60z',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntxtr7275vew9ku2glqs00paare5vn8xvask7u2mahvhufvzquaa62',
    },
    GAB_XUSDC: {
      name: 'gab/xusdc',
      componentAddress:
        'component_rdx1czzwrnrhqvnx4g25zd9825gvykjk4n99fe06yqy3jr6emd6xg69s4x',
      token_x: Assets.Fungible.GAB,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ntxvtwd2ltsx9l4stka0k9seu5lakwln72qvlc4u9w93fjpfrvwwac',
    },
    MONKE_XRD: {
      name: 'monke/xrd',
      componentAddress:
        'component_rdx1cq03set9hs0v3kju3e0dev5lysqh7tqfau0xlm9545xz333dzxmhfl',
      token_x: Assets.Fungible.MONKE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf4l37ttzn8e47uy6hydfz50x555vl359tgp53kcpy0f50jzvxzrdn',
    },
    XRD_XUSDC_3: {
      name: 'xrd/xusdc',
      componentAddress:
        'component_rdx1cr72eae5s6l4yk9wehr5n56yh9yvy2yreuatf8v5ehc0wt0rmn2j9h',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1n25d6ayc83lnxtyn36rzfk0nat6gdmn8dlha40kly6q78hfqgtpcqv',
    },
    RDK_XRD_2: {
      name: 'rdk/xrd',
      componentAddress:
        'component_rdx1cqp2fzqfqf4hc6jny8mfd5sh6nqsln90ww0qtfnmcvz2c74h4cahdn',
      token_x: Assets.Fungible.RDK,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngcsrr3pv3vrnwjg6y0m6kgxsthsjnazpppwfp79rqq00pjd98xpy0',
    },
    XWBTC_XRD_2: {
      name: 'xwbtc/xrd',
      componentAddress:
        'component_rdx1cr4nrgchhqe9etjmyl6cvefc9mjpyxlu72xt0l0hdfjw3tm4z8esln',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2j2tu2ltrpnwqhyzdd22sxcqstlls2w4jfrgtxute7dmqy54mfas2',
    },
    LSULP_BTC4: {
      name: 'lsulp/btc4',
      componentAddress:
        'component_rdx1cpp5szxh9f2jr9fnamdpde73lwf00c2z5zet66h9gs5hxs4gxkv7m5',
      token_x: Assets.Fungible.LSULP,
      token_y: Assets.Fungible.BTC4,
      liquidity_receipt:
        'resource_rdx1nt3agu7ce9xpjqxu60j9cmmtjkv5kqsg34tugdafgc6fhzdfmuspey',
    },
    EM_BTC4: {
      name: 'em/btc4',
      componentAddress:
        'component_rdx1crtexusqvtst8xr7rwnmlv5780shllht23z7v72xdru76d3yuqx9qn',
      token_x: Assets.Fungible.EM,
      token_y: Assets.Fungible.BTC4,
      liquidity_receipt:
        'resource_rdx1n25y93vxgaf57g9tdlrfzd2n9ynz84c76zxhcch2s3gr9lefmxw3gv',
    },
    BRICS_BTC4: {
      name: 'brics/btc4',
      componentAddress:
        'component_rdx1cqkvln9f3mkr2dzkn943ujjyvrflj3cpltrdwugsr9wc8k7fm938d7',
      token_x: Assets.Fungible.BRICS,
      token_y: Assets.Fungible.BTC4,
      liquidity_receipt:
        'resource_rdx1nf4qakv200xg39a2pvhq7dh62tavlr49wnqsgq4r8vtk9x4pgwp88q',
    },
    DT_BTC4: {
      name: 'dt/btc4',
      componentAddress:
        'component_rdx1crvqhewg5lhla59lr42ak75ngwrg29kevx5e9xeqkcewxl3fu6n68q',
      token_x: Assets.Fungible.DT,
      token_y: Assets.Fungible.BTC4,
      liquidity_receipt:
        'resource_rdx1nt87v78grcuq3528nae4zeellqc4pmvz3rxpunctz6k48cc4y4ndjg',
    },
    XJ_BTC4: {
      name: 'xj/btc4',
      componentAddress:
        'component_rdx1crs8d46xs2qr3k5u7tuwr7ukfrls7ydqqh65arjehtgenrph2lhf9z',
      token_x: Assets.Fungible.XJ,
      token_y: Assets.Fungible.BTC4,
      liquidity_receipt:
        'resource_rdx1ngdk2x3nkfas6957f90aha8tggr36yzng8ckw3hmnhslp8njhhsjrz',
    },
    VP_BTC4: {
      name: 'vp/btc4',
      componentAddress:
        'component_rdx1cp54gp8ned0jpdgnv7mzdyua06x3g5ggyuyqfru2x6qer887ngnwkw',
      token_x: Assets.Fungible.VP,
      token_y: Assets.Fungible.BTC4,
      liquidity_receipt:
        'resource_rdx1ntct7k8htl8tf259trefkvkr4tc0mtvqv900l8t9vemnsenr673303',
    },
    XRD_DART: {
      name: 'xrd/dart',
      componentAddress:
        'component_rdx1cp6l63dytzxw6vdlmkqqg06907m8wzmmdgtrhqfjmkzmajph9rkeg0',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DART,
      liquidity_receipt:
        'resource_rdx1ng0qy8t3wxru356mm03zdq0r9cdws2wnmwegftuj2aqyxe09gwwehf',
    },
    HUG_XRD: {
      name: 'hug/xrd',
      componentAddress:
        'component_rdx1czj40sxp9dxur7ja9nkmngph5ula75uj4npwsrjtmwelflmaj489mz',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2w6f9nu0fpzf9wy5rm5a4n38md4f4u7g8720zwsj7q0xnr578yjjg',
    },
    MNI_XRD: {
      name: 'mni/xrd',
      componentAddress:
        'component_rdx1cqqv22y0u7na85v9gzyj2tp8p6wju5ylhwfsfkpmwkh5d6r9tlgema',
      token_x: Assets.Fungible.MNI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfjs9mng9rncx3armvccnsgnmjxv54zscedckp8q4yycph2ql2tzk0',
    },
    MNI_XRD_2: {
      name: 'mni/xrd',
      componentAddress:
        'component_rdx1cznh4ds824ujxw4wsj2l66gn8cfakmsre58awlxmjjvsmupehsrglz',
      token_x: Assets.Fungible.MNI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2v9ld2uknhvmz55y3ytalsnf8n20uwecpu997thg0ps0mqa6789la',
    },
    XRD_SEXXY: {
      name: 'xrd/sexxy',
      componentAddress:
        'component_rdx1cr7kf67rxd06yadxhw9dx8f8ygh60keduk9g8pk7jjq6w4jledmx38',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.SEXXY,
      liquidity_receipt:
        'resource_rdx1nfsvwlppspmurnsh03n279dk2mz20453ucsptkcq3m3z9t5rvag003',
    },
    GUH_SEXXY: {
      name: 'guh/sexxy',
      componentAddress:
        'component_rdx1cqw74cwjde9thc447kzzt8qkamkjeplgj7wv4cn62grdajqn6m9tl2',
      token_x: Assets.Fungible.GUH,
      token_y: Assets.Fungible.SEXXY,
      liquidity_receipt:
        'resource_rdx1ntc2m6w5z44n7ns8qz2vyyn2q8dn4zzaxhm0nzmfm5y44gmwyqj78r',
    },
    GUH_SEXXY_2: {
      name: 'guh/sexxy',
      componentAddress:
        'component_rdx1cq3ykk5ju8kq7hvm4lmjfa6zq5vm69uyc2m98a35t4dwv56jrean8j',
      token_x: Assets.Fungible.GUH,
      token_y: Assets.Fungible.SEXXY,
      liquidity_receipt:
        'resource_rdx1ntasxk008get5r8lj39cd26t9zwxz56qh335dq2n7rljjcpxwh0x6k',
    },
    DLC_XRD: {
      name: 'dlc/xrd',
      componentAddress:
        'component_rdx1cras55r075twahxdk3yjna76yqph7jvnwks74kwwfs033hwv6n2ufp',
      token_x: Assets.Fungible.DLC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfh8t0v8rgsxk95x8ucttaavxhm5f0eraznsddncg8ycdmpxm83amz',
    },
    SLG_XRD: {
      name: 'slg/xrd',
      componentAddress:
        'component_rdx1cpnc05jsylfc4pvw2wl4nam6j0psdewt9a3av9ejcj7ktphw7xnwee',
      token_x: Assets.Fungible.SLG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntgvzcafjd2hwchem2yshx4x0zf6m2ntmf0ayldzzwpxj35nm6gs2v',
    },
    SLG_GUH: {
      name: 'slg/guh',
      componentAddress:
        'component_rdx1cqym6s3ndlfdc2uff8rw33w6l36ke29v9ymw0dzvd0vsazu0tsqr5r',
      token_x: Assets.Fungible.SLG,
      token_y: Assets.Fungible.GUH,
      liquidity_receipt:
        'resource_rdx1ngreryg5gsk9tnhly0fmfdvgtj662fdduv90hr676urz8y8388yqj3',
    },
    BLSS_XRD: {
      name: 'blss/xrd',
      componentAddress:
        'component_rdx1cz2lufkkql5uslyu9upz4hunvpnt3jm8sw8f7w4fhqqjdlewrw92k0',
      token_x: Assets.Fungible.BLSS,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2wmud4vyp28vjh7re6wgynqc7rmvrnux9sts9yjqehhr0m0h29n2w',
    },
    RADO_XRD: {
      name: 'rado/xrd',
      componentAddress:
        'component_rdx1cr02et8s3rv5384tssutxa8tj3l2af6e4mu6f49084xg3wwfj66zuu',
      token_x: Assets.Fungible.RADO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntj9twls9nrkvqnw8y4vedq5x6mfj2uqlhrfcuhdl2z68p9pac700e',
    },
    RZR_XRD: {
      name: 'rzr/xrd',
      componentAddress:
        'component_rdx1czvscu38hm58320lr0jfg7gvhvzphupvxrj53lnp50nuge232zc7fq',
      token_x: Assets.Fungible.RZR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng2jutzuw624jxgnuma4vkd09qzm0sxllurxcw3qzt56z342zpdy0y',
    },
    XRD_DEXTR: {
      name: 'xrd/dextr',
      componentAddress:
        'component_rdx1cpu2jt8v9fn69nunc3uxawstyy6drvfdjvnyl3487sqkcj3m9jmlzt',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DEXTR,
      liquidity_receipt:
        'resource_rdx1nf6qfvy82fsr0d9lxh46hd3n4akajg5pc59uwa9u3g05u6m843auw4',
    },
    XRD_HUGD: {
      name: 'xrd/hugd',
      componentAddress:
        'component_rdx1crdk09e6re5awv6nfv5anjaevymjrnxrpnxtt7tr5pdtea9jwwj2cg',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.HUGD,
      liquidity_receipt:
        'resource_rdx1n2c73rxtq3c8lys0sfuxvsuwqkj33pqwseeema0sgszw80emdu5dks',
    },
    KYW_XRD: {
      name: 'kyw/xrd',
      componentAddress:
        'component_rdx1cqn2f27535pcahd9j9lr5c5hzvel8gyxe3njeh7fxparmktsd6p6cw',
      token_x: Assets.Fungible.KYW,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngcs99s362pa544jlz2r4dltjpp6j8ummffsnfxyxcme9v8p49pv9y',
    },
    WEFT_XRD_3: {
      name: 'weft/xrd',
      componentAddress:
        'component_rdx1cqef27ru3lscjnmwnpjuzqgtxyjx7e02tzmu56dxg5kkpplm83dlqw',
      token_x: Assets.Fungible.WEFT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng9xyutfu8cfa8dt5s8l2kydkfxgwuukn0hpjtm8xjt42mxdvege9h',
    },
    FLOOP_XRD_4: {
      name: 'floop/xrd',
      componentAddress:
        'component_rdx1cpyr9t33vz59637ywrvfqlph5nnzmpp5tgxp6vsw2mcw6qwngr33d9',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngm4agyje0plcrclraf3pkpzg74fj3wgsllm9p0na997kk3aw0hlnm',
    },
    CHUG_XRD_2: {
      name: 'chug/xrd',
      componentAddress:
        'component_rdx1czwf7l43a6sz5pflcz7wu4y30vc7rkh7mcz79dxsx9vw2wx6zrmns0',
      token_x: Assets.Fungible.CHUG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2z66hq90puqf8dcj2zjjnm9ymuu0le2z8nnvm57nlrqxpwzjx6r3e',
    },
    JTM_DNT: {
      name: 'jtm/dnt',
      componentAddress:
        'component_rdx1czdcdr5vd4vfkmkusfl7ec6y7ekfyrwz3pwqc3cw732szahva4v0tx',
      token_x: Assets.Fungible.JTM,
      token_y: Assets.Fungible.DNT,
      liquidity_receipt:
        'resource_rdx1ntmpcat2zn43tjfsuzjp49vsaz3p3wg6u8jnzmtzxx4g32wcpun8rl',
    },
    FLOOP_RADIT: {
      name: 'floop/radit',
      componentAddress:
        'component_rdx1cz48l9n98szhjnlrx5ktcgudp4vg9wkx0pq2smtst9j0cl8k5knypk',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.RADIT,
      liquidity_receipt:
        'resource_rdx1ngudq62p5gfwpv5stnzww09n52zdrm6hl7v3zvldrdg2dn7mhdtw9e',
    },
    MARS_XRD: {
      name: 'mars/xrd',
      componentAddress:
        'component_rdx1czudq3rrjkyzc5jn3x4gladl03l509694z98mdrsyr3kmp6pxsvsd5',
      token_x: Assets.Fungible.MARS,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2exy77cepegqelg8g4kqlmfhdvss3r4t8j4mke43wss4zkdkm7qyn',
    },
    XWBTC_XRD_3: {
      name: 'xwbtc/xrd',
      componentAddress:
        'component_rdx1crwp8384s2ugrh203lcpvpp53lvkvt59wgfa3q4u3x72ktjwxclkza',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n223rn5v4g0dt94we0kq84dyt4vxcrt7z7cxg6hjzcvz9yx89zqp96',
    },
    HUG_XRD_2: {
      name: 'hug/xrd',
      componentAddress:
        'component_rdx1czawyxfhl5eye3sk4gsmvznsnrgmgckynqr9xhg4r8fsuv2yu9spnl',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf7ewnde7ed6uzsm0gse8hxa3slht7e0ysrj4s3vxzq35a565hxdcq',
    },
    DAXTER_XRD: {
      name: 'daxter/xrd',
      componentAddress:
        'component_rdx1czkv4v7xlqfzcd3fmuf69wpyefmwkzwp9lste6tvwk8k2t5awawdus',
      token_x: Assets.Fungible.DAXTER,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfhvsw53t2ylz20vgvwwkpueacvhd3z2w8xnh7m4lwgtajmj9sprm9',
    },
    HNY_XRD_2: {
      name: 'hny/xrd',
      componentAddress:
        'component_rdx1cpkuexyqsz83hw0yu70xffv9qugrpw4al66hg7gutxsu4x5xmamhyg',
      token_x: Assets.Fungible.HNY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng4500twjn9jgt3u6r5y8rq0pd0fgmc7zgdw4vxc3vs6kjavzcsw7g',
    },
    WIF_XRD: {
      name: 'wif/xrd',
      componentAddress:
        'component_rdx1cpy33tcllflgz8vymsh5wpmkp2fsr80lugmcc2g7em4rddnxncemy0',
      token_x: Assets.Fungible.WIF,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfjk9p75rkeg4u8vuqm5qpyj2pavzspd678zf5d20p3nstfrpvw7xd',
    },
    GOLD_XRD: {
      name: 'gold/xrd',
      componentAddress:
        'component_rdx1crpe20u0lsfdyggpuztf8rup6rl0w7g34rnsvw2tt082plswklfzsr',
      token_x: Assets.Fungible.GOLD,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf08grapj0lgagwyahahme95fszwx0r8hw9pckwktq2w4q9yaxajkk',
    },
    BOB_XRD: {
      name: 'bob/xrd',
      componentAddress:
        'component_rdx1czr4wp60ds8mcxn67qtl59ymyct58g8qzg5y6qymt7mclxq3mvsx2q',
      token_x: Assets.Fungible.BOB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngxv24why5mufvj227e9qpfmapuvacw4wt8h33at7vmy8jx37u0ha5',
    },
    BOB_XRD_2: {
      name: 'bob/xrd',
      componentAddress:
        'component_rdx1czxa92tj0exqat4p7xvwf0fdn0cl88kzea67veg25g6x5d62f6kha3',
      token_x: Assets.Fungible.BOB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntqlw9f7wpv9nqntv0lqk43cga2pw29ln774tjz7tk8v9nv0tcphpv',
    },
    CAVIAR_BOB: {
      name: 'caviar/bob',
      componentAddress:
        'component_rdx1cpgv2ussg0c6scac4w29kk70tfqg23ck9t0w7l759r6xrhs4sj5w7g',
      token_x: Assets.Fungible.CAVIAR,
      token_y: Assets.Fungible.BOB,
      liquidity_receipt:
        'resource_rdx1ntnnjucrjxca0767g2quglhpy8spktftp4hwke7xmkndnnmulym4an',
    },
    NAKA_XRD: {
      name: 'naka/xrd',
      componentAddress:
        'component_rdx1czgk5hkfpuqy87c9faf7vj74f868ja62yq0596awm07dxw5hd6u6nc',
      token_x: Assets.Fungible.NAKA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nt29vvjaqdalwyqdpl7kr5ukwvnyr65gc8pjcpgw7dx5asp0ppr5rs',
    },
    NAKA_XRD_2: {
      name: 'naka/xrd',
      componentAddress:
        'component_rdx1crrjzzqsk79uty25c2qj92hlpzlgnqm2h8cqynm5nmq4adjra043rc',
      token_x: Assets.Fungible.NAKA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf2gat2j303dx6as0y8yvwd9c2qtj5xw4agwg6s3scfefys664mlqa',
    },
    BOB_CAVIAR: {
      name: 'bob/caviar',
      componentAddress:
        'component_rdx1czrzspws4ugqkwr53gvctpmmqapsder49f6569nrly8yqxrfemmfvg',
      token_x: Assets.Fungible.BOB,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1ntwjvjpzsgtk6t7gjttkyl5m5za83qnnjkgzu84juu6f5ry6k9klv4',
    },
    WAXRD_XRD: {
      name: 'waxrd/xrd',
      componentAddress:
        'component_rdx1cqfk4f8ndcqjpzuyrj797rdtpacg22v3x93ptg00y5y9alr9fwnq4t',
      token_x: Assets.Fungible.WAXRD,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng6hsklkvwqtertl5y4mrw8z3tetprktp8l5thnlq848us0f9gcwl7',
    },
    XRD_FDS: {
      name: 'xrd/fds',
      componentAddress:
        'component_rdx1cqv5w975yd8dpygmkycrxzmcnlr0mv5dmu65xps4xwfr0tkk5gvamp',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.FDS,
      liquidity_receipt:
        'resource_rdx1nt9r3cgxgu928clmrw5zwntdrymd7wkk34gsu0xd6a3h6cp7mwdx5e',
    },
    WOWO_IDA_3: {
      name: 'wowo/ida',
      componentAddress:
        'component_rdx1crmejsqyjply02arh7hn8cep35ktcq5788v46a88zd46vhtyan5ct8',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1nfhjxcmvp02kdupk2nggxgyldcj9ds76f29h54ekcevs75wrrs24qp',
    },
    WAY_XRD: {
      name: 'way/xrd',
      componentAddress:
        'component_rdx1czaenuufa4ktatggk504srfp5aspqtc5kxcqxkxrmkfx5umsq3ywgn',
      token_x: Assets.Fungible.WAY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngdgjj42nuusn29k5yf784mftqg0t27qp494g7w4awzp4arv7kjqqa',
    },
    COCO_XRD_2: {
      name: 'coco/xrd',
      componentAddress:
        'component_rdx1cqle8vm0yzczrfz6av2jhk236tvks4nuuqlle47pzk002kl3l77p58',
      token_x: Assets.Fungible.COCO,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n20qufra9q088pyu27wadhdkl2dt48exmaje24m2t6336rmhhaz6q5',
    },
    XRD_RDS: {
      name: 'xrd/rds',
      componentAddress:
        'component_rdx1cp5z2g7t5qrwdj4ep35706nhkgz6uyntfcv9pv6ydver2hewdqaqqp',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RDS,
      liquidity_receipt:
        'resource_rdx1nfrdkdpa3jmmm4w6wf4dt82hr7efv8ffyy27p4vxg5ndlujz3tpdwv',
    },
    WAVE_XRD: {
      name: 'wave/xrd',
      componentAddress:
        'component_rdx1cpsw9pwyj04v0layv5cgk3d95zkjr55rr3smvszxs67yg8xxf9sttd',
      token_x: Assets.Fungible.WAVE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2xc6fnq65kmrpru6rx23fa9e0k0na6yqxkzx6kw6xqpkguckawpyd',
    },
    RDS_XRD: {
      name: 'rds/xrd',
      componentAddress:
        'component_rdx1cpvy3kgc5davtcqr6gvv5tdvhpw0q5gcg392yls6xvdak67x28hru7',
      token_x: Assets.Fungible.RDS,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfpmp0g983nqfm7qk0m6utnlyezy3uezcnluff0tde6lpkxj4myme3',
    },
    PHNX_XRD_3: {
      name: 'phnx/xrd',
      componentAddress:
        'component_rdx1cpkh06eay4u3arry6f8x5h3jfwfpvsqkqsntsmz303u6s4cygluvez',
      token_x: Assets.Fungible.PHNX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntq9qzkm6kvea8urkkn5xjszps7ewwsffsncm3ptyt865rwsy6rzvv',
    },
    MOC_XRD_2: {
      name: 'moc/xrd',
      componentAddress:
        'component_rdx1crqs3jd5pajwfsuqfcanh0clk8snxx63y3tteusl5gjhancz9g8lng',
      token_x: Assets.Fungible.MOC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfgtg5nr792mw4jwr7327sq09dv89kapvt3ns477zvae82jyy57ztr',
    },
    DFP2_XRD_2: {
      name: 'dfp2/xrd',
      componentAddress:
        'component_rdx1cqemvllad55as4qzr2xtcef3wlul2uudxe3jsgzw2r8h504sxmaz6a',
      token_x: Assets.Fungible.DFP2,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ng5uwv0sv9faszhju74p9ylpnvh5382qjdt50n8w9akh24f565cd48',
    },
    PHNX_XRD_4: {
      name: 'phnx/xrd',
      componentAddress:
        'component_rdx1cq2dupe7gnhjm22ql879u4hntexq2v6d42m6wuu0h42jgwftnvtzme',
      token_x: Assets.Fungible.PHNX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngs82u8kzhuxsw6mgxtwu72mf8gsl4kxquw6kz7rdj3ayvzpjag5dl',
    },
    PEPE_XRD: {
      name: 'pepe/xrd',
      componentAddress:
        'component_rdx1crruzdtvwnclj59dza49ycag0zpxfq6dg9fkwfylrcqymumw2cs0up',
      token_x: Assets.Fungible.PEPE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2l3dqjr2s0sv2w3uyj0yyscrhkht87jtlcuydpvc5jlkmarhaqd4p',
    },
    JIT_XUSDC: {
      name: 'jit/xusdc',
      componentAddress:
        'component_rdx1cpddm4252kjff8qqctke2x7jpr8wz7hwsp9m6ehavusd9a8z9kce2k',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1n27xzgecrs8aj5aqgh4hgu7rlwg3lldpk8y8drrafeffsu8lkkzv4f',
    },
    JIT_DFP2: {
      name: 'jit/dfp2',
      componentAddress:
        'component_rdx1cqw5yj83anncu04y3gkwlxlnm444xnnyv2hy2qzlqmhlhj24xplr42',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.DFP2,
      liquidity_receipt:
        'resource_rdx1n2ycxrpldt6apmw4gflpg64shncgkyferhrxqf7zxujraj7pr3fz5w',
    },
    JIT_IDA: {
      name: 'jit/ida',
      componentAddress:
        'component_rdx1cpxt5tshtvgruhhf2zv4aku2ra5u4qg7g9m86fsmwz7rdadm3rye7m',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.IDA,
      liquidity_receipt:
        'resource_rdx1n2e7nvw72yr7g68zzxzph7js3edrlsfvxr7gysn2ugq2mwxg9hzqps',
    },
    JIT_OCI: {
      name: 'jit/oci',
      componentAddress:
        'component_rdx1czy938as2ze78hh0e58rdwes5g9lfsc2ak4u8yf7s0xz2eqhtx96jl',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.OCI,
      liquidity_receipt:
        'resource_rdx1ngkwk0u6mqq6ee4whptvv9glyap9e4fvjqd0emsly93qgxyrgw2d0s',
    },
    JIT_XRD_2: {
      name: 'jit/xrd',
      componentAddress:
        'component_rdx1cq788286al2fm0y3g8tqhavdpfmk3r7zzzy25lsmrgk80g9echgkt3',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2wrss3tsk0hup0e9nystd96j7sl3zjsw5qhdskyak3y05nc6rkfey',
    },
    JIT_FLOOP: {
      name: 'jit/floop',
      componentAddress:
        'component_rdx1cr8a86zyqrp246u3geec7hxjax3tk4jep3cqqhvvvsdtv8amuen22u',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.FLOOP,
      liquidity_receipt:
        'resource_rdx1ngf2ngz83yrztn8jsc5zc0vktges7ml5r8ay4fmd843swr83l28slq',
    },
    JIT_WEFT_2: {
      name: 'jit/weft',
      componentAddress:
        'component_rdx1cqh4jzh9lxdym5fx59y2ud29hl20c05mem30zu564r2w0fuf8z7frt',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.WEFT,
      liquidity_receipt:
        'resource_rdx1ntszpegg56zddn83dl0cvy2gudgn4ugcfhx5w6s7tm9vs6s44rnk52',
    },
    JIT_HUG_2: {
      name: 'jit/hug',
      componentAddress:
        'component_rdx1cqpvfcqhdveqcl7watle4s42nqkwwlru40hr6tdafjqv9n2d4e337j',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.HUG,
      liquidity_receipt:
        'resource_rdx1ngnfuhfmplh7l0j7yk8759c2yjwzk864dzdt0pg48frcqugrmafgz5',
    },
    JIT_WOWO_2: {
      name: 'jit/wowo',
      componentAddress:
        'component_rdx1cpurj8sd44m0vd473elh0ac7e94u2altdknqnzquymfx4crwpk737w',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.WOWO,
      liquidity_receipt:
        'resource_rdx1nfvp9s9ghfs0cte669yfgddhckkjylkuq2yphw9fs5tkqehmttm9cf',
    },
    JIT_CAVIAR_2: {
      name: 'jit/caviar',
      componentAddress:
        'component_rdx1cq9uruapgghmw2345d9wencc78m4v0eat692m9m02sljzqsynvngem',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.CAVIAR,
      liquidity_receipt:
        'resource_rdx1n2fz8f9a0fsy5ujsetp3n0apre97pr4gnlgfhkacgwssxelgusgz4y',
    },
    JIT_EARLY_2: {
      name: 'jit/early',
      componentAddress:
        'component_rdx1cp0g2ft7zd34m0h74fuzexv6sujrjellx9lqw3q55ev5gkmd5ntppa',
      token_x: Assets.Fungible.JIT,
      token_y: Assets.Fungible.EARLY,
      liquidity_receipt:
        'resource_rdx1n2t0ckflgl8zhzw703rpqlm5wvwmfvq0hg5zf6yvduwpftznmeh5du',
    },
    WAY_XRD_2: {
      name: 'way/xrd',
      componentAddress:
        'component_rdx1cqctkvtv66egp6eg8wclynh648v9kwx0x9vt8rtm8eg0cfyqzvp7gl',
      token_x: Assets.Fungible.WAY,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nghp2z8ma04zvfpvzpxscwhcch7tu9vtsxfnm49jlqzp74xx6vn52y',
    },
    SSS_WEN: {
      name: 'sss/wen',
      componentAddress:
        'component_rdx1cztsrpqzsmrfrsm8kv3psdgryx95hyt50lhzht7yq8r4zsfzam4d46',
      token_x: Assets.Fungible.SSS,
      token_y: Assets.Fungible.WEN,
      liquidity_receipt:
        'resource_rdx1nt7yax35culupnhzumyr25wq08eu4s7v6gnhy2x7prmr3sf6pg75cv',
    },
    MOX_XRD: {
      name: 'mox/xrd',
      componentAddress:
        'component_rdx1cq8a75pesnkj0x3958t55vkpz80y390cg84lrvnxundmumkl0whkfg',
      token_x: Assets.Fungible.MOX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf8jwkxxu98mrwd8eds2vtyt3hkagprt6g4yy0mcmmwu9as366rpdx',
    },
    XRD_XUSDC_4: {
      name: 'xrd/xusdc',
      componentAddress:
        'component_rdx1cr0vjqvftwav4zzwqddfw3zt00h2zhjkz5j0u422zq0ae4ef22ckk7',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nfh5uh0kkndk3f2zptuv04d5z23rfluzmpgndknvn49qt53gahsjym',
    },
    XUSDC_XRD_3: {
      name: 'xusdc/xrd',
      componentAddress:
        'component_rdx1cpw5jjntdf87c4n28uqm5puhx7zcz6ym0m0vdzhs7fm94f6qn5x06n',
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n240jdl2x5m594r8cgz0fat46yptwe45u50xs4vs4za0tf5fct0npy',
    },
    LSULP_XUSDC_2: {
      name: 'lsulp/xusdc',
      componentAddress:
        'component_rdx1cztrmd97z3rt7uxn57jkv3h6yzr2cceayvvxd9tvsszk3z3d904hjd',
      token_x: Assets.Fungible.LSULP,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ngv4m9tykkajd3r42rnrqyueqn6veafs5r0x7qvlf2w83l5av7lwev',
    },
    CVX_XRD: {
      name: 'cvx/xrd',
      componentAddress:
        'component_rdx1czlha99t08y8tkrgmmy5tzvvccq4hy96pmncrdqdtghz787v5r7lr5',
      token_x: Assets.Fungible.CVX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfc277ajtq3ts304axvcxndk8akcr5fcg0g0ly7yzaqyhjnjpeshrx',
    },
    XBNB_XRD: {
      name: 'xbnb/xrd',
      componentAddress:
        'component_rdx1cp7sak5h3epzfevr5w3rk3pn8hfr9g2dyule0jphehd3csf2h7jcwe',
      token_x: Assets.Fungible.XBNB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntk84pnj2ecunvsa8208x0d2az5lq26jdmc9w5dm0ythtezgrp23ev',
    },
    XSHIB_XRD: {
      name: 'xshib/xrd',
      componentAddress:
        'component_rdx1cz8kmcvgxj2jtgqcuxnrd4q4s2yu7v2cytndppghprgw2hwlxzn99g',
      token_x: Assets.Fungible.XSHIB,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngh5rdv3je0txkzljaegcm4grdxavtxwedxutdcdz4twsetavqf2s5',
    },
    XLINK_XRD: {
      name: 'xlink/xrd',
      componentAddress:
        'component_rdx1crrqy8nq64hr5f35px0s8r4yyseznt7ntmw37hn6sr7w6nlhf2j350',
      token_x: Assets.Fungible.XLINK,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf9x68wpy3qp4evugydjg9kmwzjgy0p0afdgsxnm2w6hp8g9jcme6c',
    },
    XWLD_XRD: {
      name: 'xwld/xrd',
      componentAddress:
        'component_rdx1cr7hhvhqcvjlaj4sv2r5rpxhvppgr5x36upxjjgh3rffhz36umq9zl',
      token_x: Assets.Fungible.XWLD,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nftc786ypdsyxwqwxa7hqyjxx302saklp5d8dny984n3qg948rzxtn',
    },
    LOCK_XUSDC: {
      name: 'lock/xusdc',
      componentAddress:
        'component_rdx1cz4wtfjwns7l0ktnhtcqaka953fr5x0rlelvl9adckn3qvm6nfpply',
      token_x: Assets.Fungible.LOCK,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nteh6wh3n63s46czw7xyyuu65rgn7ysf8rwg4t69t0z3eya3cstaeq',
    },
    FLOOP_XUSDC: {
      name: 'floop/xusdc',
      componentAddress:
        'component_rdx1cpq7cmn6q8vr7ur964rjwu33ackplzsamv5mzs8j42gfzvnecmervj',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ng3wzp27agnj3r6tn3cs8m7c2xd47tj8d6vejcjhq2dvq3j8k9sftr',
    },
    FUSD_XUSDC_2: {
      name: 'fusd/xusdc',
      componentAddress:
        'component_rdx1cqmx9aqpr36anp960xes8f4wp7skc6pya6k9ra2jtlmlv24qslmwxf',
      token_x: Assets.Fungible.FUSD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1ng2m9cn34czt73x0zjjxhzrpddt5kr6juyfyxrk4uc4gudhy2nkyxy',
    },
    GIFT_EARLY: {
      name: 'gift/early',
      componentAddress:
        'component_rdx1crn2u47whcmxjvhypnr89zdv3ga74ct9c2d0gr3c4skfazuxwvqf6e',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.EARLY,
      liquidity_receipt:
        'resource_rdx1nfzhlgmfs97kzxnma43v2p4w426jw5x30neyl5elsvtntk0j9r68gm',
    },
    XWBTC_ASTRL: {
      name: 'xwbtc/astrl',
      componentAddress:
        'component_rdx1crt7u689a76xkqmejas2cg0xnxrt4flt5tl4fwp4fu58wraq8t6f9r',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.ASTRL,
      liquidity_receipt:
        'resource_rdx1nf37cnsn3mulhf87nkf456x479jve7cexhahu3s9dgpyls08mjcvwm',
    },
    COLIE_XRD: {
      name: 'colie/xrd',
      componentAddress:
        'component_rdx1cqlj07xw6ymt5dchsr0lrrj3z9qf2fe0jl9jgumhts8rt7gsdjz38z',
      token_x: Assets.Fungible.COLIE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n20zrjuvk75s07qyx2ml249t9jd6dkvnu2w9c8tz3zttqan4a2ra4h',
    },
    XUSDT_SUSD: {
      name: 'xusdt/susd',
      componentAddress:
        'component_rdx1cqjcuzlqp6hcwkps487m58f6mxnx23afm3wxnklx2lldte58hcwul9',
      token_x: Assets.Fungible.xUSDT,
      token_y: Assets.Fungible.sUSD,
      liquidity_receipt:
        'resource_rdx1nt3z0trdqs7unth2h49n9rqnqxgyhse4xrh742dyfjyveuuqa2xg7n',
    },
    SRG_XRD: {
      name: 'srg/xrd',
      componentAddress:
        'component_rdx1czmqk7hnhc25afgv029z7kctqy63hlh9m00tgawuzg2zrpvnau56f6',
      token_x: Assets.Fungible.SRG,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngys4epecv8val7y4fjdanzherkjzxcj6e7c0dvxk7c7p3apr6q7zj',
    },
    GIFT_MOX: {
      name: 'gift/mox',
      componentAddress:
        'component_rdx1crrw86qg427yntwvuwm3s3fa2dpgfstzenvvdnljaqx05e7g7qh46r',
      token_x: Assets.Fungible.GIFT,
      token_y: Assets.Fungible.MOX,
      liquidity_receipt:
        'resource_rdx1nt5fg3cr6k30h6guafylnau5z9n99slx7zdg55vajztsnrm3xwxecd',
    },
    WOLF_XRD: {
      name: 'wolf/xrd',
      componentAddress:
        'component_rdx1cze0ruz0clsfshkgxmz4pt4pdm47x2gkepqfkpdhecdcncpmnlacd4',
      token_x: Assets.Fungible.WOLF,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntqyqa443g995vx7e2flxgjqaylj8aphzes8967gh9f8chcqdmcv5g',
    },
    GROWW_XRD: {
      name: 'groww/xrd',
      componentAddress:
        'component_rdx1cq7fdrl9p7lek3aajmkt0rv5f24q2clltnt6jrp0w4hzjndj65v785',
      token_x: Assets.Fungible.GROWW,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ngkk67l2drgxvgj67kwshe0npcf5uzvxmqk7xfpqqn9tgq5lfpk5xv',
    },
    CASSIE_XRD: {
      name: 'cassie/xrd',
      componentAddress:
        'component_rdx1cqxplrxenvt2qnrldrs9lgh9x8rsuzp2hcerxymhe7x8shf9cp3mua',
      token_x: Assets.Fungible.CASSIE,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf3tatvzclfw7tlwmgsj97smkrd99c6wcs64ymnvphlatd7ca7jts9',
    },
    XADA_XRD: {
      name: 'xada/xrd',
      componentAddress:
        'component_rdx1cp99wdxrgsk7ajqzlgl47rdzwvmj92zc56kxwfw02juzwt0syqv75u',
      token_x: Assets.Fungible.XADA,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2w5t9lnfzdl75c095ng8lsnjmja2x9vyd7h7xljsgs6c4kjdugg6f',
    },
    XDAI_XUSDC: {
      name: 'xdai/xusdc',
      componentAddress:
        'component_rdx1cryft9r4nwdgvnkptqwvc733j222xafqvyhrwplc5sqf68yd7kjtge',
      token_x: Assets.Fungible.XDAI,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        'resource_rdx1nf2qru2a6pptdlu5g0pt4j37hfkshdffekn83x22cn8tqvvmjzrmxz',
    },
    XMKR_XRD: {
      name: 'xmkr/xrd',
      componentAddress:
        'component_rdx1cpwhaxz60qsrnfjsn30mqxsn690jel6n58p57dtx83kn7tfg0cun4w',
      token_x: Assets.Fungible.XMKR,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nf0khxmas0lvrknzcryq9at64twxrf4wwcefha63hcxvmxn3yq7eyk',
    },
    XUNI_XRD_2: {
      name: 'xuni/xrd',
      componentAddress:
        'component_rdx1crqgyzm2056mad9gu8juztyz0da6k6c3wjd8mmm7ystk0gha8esvss',
      token_x: Assets.Fungible.XUNI,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1n2p48us8mcux90mkyswr64858rhrg6p2fwc4e4fnfek67eehhkl2x8',
    },
    XXLM_XRD: {
      name: 'xxlm/xrd',
      componentAddress:
        'component_rdx1cqmj4u38j3084z75unw40cfn0za4enszh723pzv0errehld5v9hupp',
      token_x: Assets.Fungible.XXLM,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nfc00rfdeq0xhx0tfpq4cwrspw0nl8del8amsfq48aerxwfhvecl4g',
    },
    XTRX_XRD: {
      name: 'xtrx/xrd',
      componentAddress:
        'component_rdx1cqysx3s9ryfu54eyqdty4dpuazatkjxxvgr8kpc2tnsxc37mmtyr6y',
      token_x: Assets.Fungible.XTRX,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1nth045epdnkcdd4qdnle2xar7k68sq2a9sm4dsmat8gg675cs5paxe',
    },
    UNIT_XRD: {
      name: 'unit/xrd',
      componentAddress:
        'component_rdx1cpzhzpfa8242cqzkryuyusq4x033m0frmnznppfqwjnqfnhrapfz69',
      token_x: Assets.Fungible.UNIT,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        'resource_rdx1ntx2u9p2a7zekcpy0pmh5565assxpl0k9f92cve5lnep8rge7f7mf4',
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
