import { Assets } from '../../assets';

export const OciswapConstants = {
  pools: {
    xwBTC_XRD: {
      name: 'xwBTC/XRD',
      componentAddress:
        'component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr',
      lpResourceAddress:
        'resource_rdx1n2zsvvdahtnlm53ms5f6zazjx6rnnmu2u6xjdr8ggzw45way0tefe6',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 8,
      divisibility_y: 18,
    },
    xETH_XRD: {
      name: 'xETH/XRD',
      componentAddress:
        'component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm',
      lpResourceAddress:
        'resource_rdx1nge9z3amafwyqvjzg5fzwk9m8dkcu584p6lcme7dx4p72x9xcaa3la',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xETH,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    xUSDC_XRD: {
      name: 'xUSDC/XRD',
      componentAddress:
        'component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f',
      lpResourceAddress:
        'resource_rdx1nflrqd24a8xqelasygwlt6dhrgtu3akky695kk6j3cy4wu0wfn2ef8',
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 6,
      divisibility_y: 18,
    },
    xUSDT_XRD: {
      name: 'xUSDT/XRD',
      componentAddress:
        'component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g',
      lpResourceAddress:
        'resource_rdx1nffckx9ek5x5hn2cxj2hc0tk8yvwh6a2rh9jckgnwha7smry2rtr0a',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDT,
      divisibility_x: 18,
      divisibility_y: 6,
    },
    BOSS_XRD: {
      name: 'BOSS/xrd',
      componentAddress:
        'component_rdx1cptzau43t6le9rch05sx4qaksk230p5yjeq69a09dywm3s9l6lrhhc',
      lpResourceAddress:
        'resource_rdx1n2lmx2dundqexrj32s43r73hkyn8m426d4xweg7fqs8etwxzj9mtnp',
      token_x: Assets.Fungible.BOSS,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    BOB_XRD: {
      name: 'BOB/xrd',
      componentAddress:
        'component_rdx1cqjyrxg37ujgvyya0y730w78x5ac6fph8e5qkckmckcfgp39mnhfj6',
      lpResourceAddress:
        'resource_rdx1nfv8s38a877el6hwumzjcez3z34lfalyujqqy77qvlt8jt69sdcxm2',
      token_x: Assets.Fungible.BOB,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_DINO: {
      name: 'xrd/DINO',
      componentAddress:
        'component_rdx1crvz9tx6xvvlsunxzq09cz7pytedljjzzdg00yt9n47ytvm8tefmws',
      lpResourceAddress:
        'resource_rdx1n2hxfsajx6ulcpr3vcfw29cx2fy3j2we96627csm4qcaqegyw2juwh',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DINO,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    IST_XRD_2: {
      name: 'ist/xrd',
      componentAddress:
        'component_rdx1crr280m6rynws60knx2aff2k0da57uf6xv9lhawrh3wvpvlpmvv073',
      lpResourceAddress:
        'resource_rdx1n2k5wu7femr5lxj6l2uha4rqgwxvznt8x54lyfu3v3g362klpqd92w',
      token_x: Assets.Fungible.IST,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    EARLY_XRD_3: {
      name: 'early/xrd',
      componentAddress:
        'component_rdx1cr76q9t49y09t884vgz8x20p2huxkcd8a6kgyrw8jm22s83fxddr0q',
      lpResourceAddress:
        'resource_rdx1n2e3gvz7ad5q7hgdpq4wwl770a2kz5pksrayz9m72m30x5r0m5cjwt',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    PRICE_XRD: {
      name: 'PRICE/xrd',
      componentAddress:
        'component_rdx1czq6xdkhy293zc0nark2u7gwwrawat2jg2qquhfufjrz6x89au89hl',
      lpResourceAddress:
        'resource_rdx1ngh2pl2h43588m9lfru7plfg64m8xpzjt8nyqv44tcqwcunnxgwg53',
      token_x: Assets.Fungible.PRICE,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
  },
  poolsV2: {
    OCI_XRD: {
      name: 'OCI/XRD',
      componentAddress:
        'component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp',
      lpResourceAddress:
        'resource_rdx1n2qukjm07d26matv7cyc5ev2f942uy44zn9h3x7p8hnm9dah5flht4',
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    REDDICKS_XRD: {
      name: 'REDDICKS/XRD',
      componentAddress:
        'component_rdx1cpwwhuxpe2npedx0axkj4nae8uv5222r0syjtu5fxuaxaj78rf30v9',
      lpResourceAddress:
        'resource_rdx1ngffpg3d3le29c9ajtjw0dxt9utjckujfr0nrg48lp05j30yfpvj6r',
      token_x: Assets.Fungible.REDDICKS,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    WEFT_XRD: {
      name: 'WEFT/XRD',
      componentAddress:
        'component_rdx1crpq83nf76ea2dkkjxfwr426qvmpu9pyakh58ay3eyswe4ps5yn3q2',
      lpResourceAddress:
        'resource_rdx1n2k0uxng9yfqq7xwt3xnwjz5ue7danx3rz57krxch0626m9lrpkpcx',
      token_x: Assets.Fungible.WEFT,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    hUSDC_XRD: {
      name: 'hUSDC/XRD',
      componentAddress:
        'component_rdx1czy2naejcqx8gv46zdsex2syuxrs4jnqzug58e66zr8wglxzvu97qr',
      lpResourceAddress:
        'resource_rdx1ngd0xja03m9qs03a969c3dqa8xpkxfjddx3qvty0sk6escqfl95cry',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.hUSDC,
      divisibility_x: 6,
      divisibility_y: 18,
    },

    hUSDT_XRD: {
      name: 'hUSDT/XRD',
      componentAddress:
        'component_rdx1cprwh9r3wx6vvt0gnv8wscwljegzcevp0hzuju2873eza7fgg493fw',
      lpResourceAddress:
        'resource_rdx1nf2fcykqc67ff0yh4a9m4wvpt0vkwct256lvz4h0h2fa85wzpg8j6z',
      token_y: Assets.Fungible.hUSDT,
      token_x: Assets.Fungible.XRD,
      divisibility_x: 6,
      divisibility_y: 18,
    },
    hwBTC_XRD: {
      name: 'hwBTC/XRD',
      componentAddress:
        'component_rdx1crd7xk0nu07kj60artzz6evws7r6w69lwarf0nqmkxuwwluy5xjud0',
      lpResourceAddress:
        'resource_rdx1ng9scnrsyp2hcezn0lg026xnayvh69wz0qjq2dhxw36v5rknddf8pc',
      token_x: Assets.Fungible.hwBTC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 8,
      divisibility_y: 18,
    },
    hETH_XRD: {
      name: 'hETH/XRD',
      componentAddress:
        'component_rdx1crumqsy0nu4pl3fwah3nkf8eg8qhltxenk83wh9tzlmr5jnsqs3x4c',
      lpResourceAddress:
        'resource_rdx1ntjl2shav6nez5wdesv2cghms5v5vu3qv3cgeysrwgj2j89agxl4pt',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.hETH,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    EARLY_XRD: {
      name: 'EARLY/XRD',
      componentAddress:
        'component_rdx1cqvn2u9wkgm9k6ksmz2qreau6gr3l0jdn6cwjqunnz2fluex0cgrrl',
      lpResourceAddress:
        'resource_rdx1ng9kjy72tctduldaa0w0xeha8nlua0vj0t0nts9qljmfxx7fv8q399',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    DELIVER_XRD: {
      name: 'DELIVER/xrd',
      componentAddress:
        'component_rdx1czre754pv64wd74v4mn80769jy5l3p63ecv9unzja7hemcmf02vvjh',
      lpResourceAddress:
        'resource_rdx1nt960vrmfl9z5d4pqquwx4swtt8sszf0jjjv7q8s04c65c6j89gqeh',
      token_x: Assets.Fungible.DELIVER,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    HUG_XRD: {
      name: 'HUG/xrd',
      componentAddress:
        'component_rdx1cr9kzxefdnadsrmajswvenf803fgw8j4h8jlcse4z3m2t3q384xdup',
      lpResourceAddress:
        'resource_rdx1n2ts66jxna2dffw9l4ruqmc9slrzlq4n5cul2qackjqjjzm059rtde',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    SCRYPTO_XRD: {
      name: 'scrypto/xrd',
      componentAddress:
        'component_rdx1cz9w9kpuj5q0r3hyzl9q065q54ytwgxp22ckvfmp9g2xvjrshmg5mk',
      lpResourceAddress:
        'resource_rdx1n20wuh9s6sk6006wzpcsycdltu4jx83rnt4n5cpcjrhn7s7gz7zjsf',
      token_x: Assets.Fungible.SCRYPTO,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_JWLXRD: {
      name: 'xrd/JWLXRD',
      componentAddress:
        'component_rdx1czzh0zy3fk6vtgjyhurhqfq6dek7qzgw68v30s62v3krrexkkau7d4',
      lpResourceAddress:
        'resource_rdx1n26s4exwynt0pkn8xuszxz8tuwhs6ja5pe3m5y6q7t6rxnp9ke373t',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.JWLXRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    GREAT_XRD: {
      name: 'GREAT/xrd',
      componentAddress:
        'component_rdx1czxl0hrvxyl8s0ehdfjcqmq2z2gqassy7fa55u8a99hm2lm5rzgfxe',
      lpResourceAddress:
        'resource_rdx1ntg5zqf24q9eyejj0u3smsu89zuvqrurz7m6dlwv4lex460660zqpj',
      token_x: Assets.Fungible.GREAT,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    FOTON_XRD: {
      name: 'foton/xrd',
      componentAddress:
        'component_rdx1cqnd5gd576227h8sfga03v53c40a3a95uazmzsvul8af7ru9qdmt6u',
      lpResourceAddress:
        'resource_rdx1n2872f375y5tz6n7ermx69p39ecmc7ezzwskp8vkalpnklvv65d2z5',
      token_x: Assets.Fungible.FOTON,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    WRP_XRD: {
      name: 'WRP/xrd',
      componentAddress:
        'component_rdx1czk0ljhsjuwl4hfe895cfcg3zfheky5ntz0ds8py3clmytmk05p8fs',
      lpResourceAddress:
        'resource_rdx1ngg6ssmyqujshq226yqd9zcer5wjthm0talfhdmfvu8gr9g0uc0pr0',
      token_x: Assets.Fungible.WRP,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    DELAY_XRD: {
      name: 'DELAY/xrd',
      componentAddress:
        'component_rdx1crc4fxqecgzjr0ayh590jf5vyxqz4npae68a4fpt2esmlh8jx3d4lv',
      lpResourceAddress:
        'resource_rdx1nglxwdev2h634wpgzvq0hpjju2w4wlqyuvlc96age0vj28p0pp2qpc',
      token_x: Assets.Fungible.DELAY,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    PHNX_XRD: {
      name: 'PHNX/xrd',
      componentAddress:
        'component_rdx1cpwlysnc6uvh08xjyucxftrdcxmfayujn9eplx4k5y7amv6xzw05w5',
      lpResourceAddress:
        'resource_rdx1n2lctfem65vkxzjxpvqzcaxpk475a9lt8sgycyxprqejrufhrrttxz',
      token_x: Assets.Fungible.PHNX,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_MOX_2: {
      name: 'xrd/mox',
      componentAddress:
        'component_rdx1cpawyeunwx6us04xnv8lr5cxsgjsnl2taukv4yryx04u8dugdlvkep',
      lpResourceAddress:
        'resource_rdx1n2vq0c3h0gpmpmuaqan5l6pvs7epw5tqv45tedfesv6mvnshe5lpap',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.MOX,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    UNIT_XRD: {
      name: 'UNIT/xrd',
      componentAddress:
        'component_rdx1cqvuqp6ay6gj2ewup66hywmfmhernuzklhk2a6y4d6nav6frjx2jdt',
      lpResourceAddress:
        'resource_rdx1nfdrgyagjg7s03smexv9v64ev5y0z8v2sza03fwkmuvjn8hnhm85dv',
      token_x: Assets.Fungible.UNIT,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    WOWO_XRD_2: {
      name: 'wowo/xrd',
      componentAddress:
        'component_rdx1cp6fus3tmgfddxvfksn9ng8nh7rd0zqyarl3pgvatzfcwdzuq4nvst',
      lpResourceAddress:
        'resource_rdx1ngv3qc6st8a8fexnqz23nl0ggnydup2a6zaultldushkpxrtmm02up',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XWBTC_XRD: {
      name: 'xwbtc/xrd',
      componentAddress:
        'component_rdx1cpcd3wxrwgtldnrtkz995dzj6zhsqg2sym9tpqgmg7g9wsuu00jn65',
      lpResourceAddress:
        'resource_rdx1n2zpan5hvgk4z6vnqhxf3xghtmaj6fvahmuy6ny6n3tfj308hxfklr',
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_ASTRA: {
      name: 'xrd/ASTRA',
      componentAddress:
        'component_rdx1czns3lsk3qfa06jk53540pt2l0pcpe6ptxenm7ae0rxw48ucpwepk2',
      lpResourceAddress:
        'resource_rdx1ngzusd4tdn0fzlt54amh93lu04n83yympwust9hr34ttcgy843zglq',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.ASTRA,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    DGC_XRD: {
      name: 'dgc/xrd',
      componentAddress:
        'component_rdx1czm4dtz2aj24nh9p7c9epaceu0eflw93qerq8xey556ksvg09g9tz2',
      lpResourceAddress:
        'resource_rdx1nt5rjw0wjy9pd3zm5qx84tzm7ely2hfccrzztf363p3432k7nf6pdv',
      token_x: Assets.Fungible.DGC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_RR: {
      name: 'xrd/RR',
      componentAddress:
        'component_rdx1cpyv9wwfslldlt4lckxd9ftp2gllkgjx4j5j7kv4jdnazq8pcw9twq',
      lpResourceAddress:
        'resource_rdx1nfm2fc993e5wa0f2x3fctxq4kx5087a9cwmxhtt8gcxs825jqvxlsl',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RR,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    HO_XRD: {
      name: 'HO/xrd',
      componentAddress:
        'component_rdx1cr7vjhnqxwpq3u4l4f54cpw2htjgtmtfpraq6k0lumuqmc5xeg7z7v',
      lpResourceAddress:
        'resource_rdx1ntqdyvr2jghnsx0gncl5a8gh896akehv4d7rhw26ez6wyp938rugry',
      token_x: Assets.Fungible.HO,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    SPED_XRD: {
      name: 'SPED/xrd',
      componentAddress:
        'component_rdx1cq5e6lsef6vsv9yqs2aa8fpna3lcl4jweyr45tx6puyzwg9n0aredh',
      lpResourceAddress:
        'resource_rdx1ntkzyn8889ljevmlhhhegtl2wt9m363xjudr8drpfracnjugehyjfy',
      token_x: Assets.Fungible.SPED,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    GOD_XRD: {
      name: 'GOD/xrd',
      componentAddress:
        'component_rdx1czxhzcc9w94ztvv80hv8aae40ytzneyf2009s4wyqn9n2ethhhth35',
      lpResourceAddress:
        'resource_rdx1ngj6s83en2rv7rt0pxkk9x0u73zdzmnerucgdg4w8xuk7wuqrm4ypx',
      token_x: Assets.Fungible.GOD,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    KGLD_XRD: {
      name: 'kgld/xrd',
      componentAddress:
        'component_rdx1cr2xaxputc48ucws8nkctzmdt7g0z60ft7krmlep085uuuhnm9xhgy',
      lpResourceAddress:
        'resource_rdx1nfwyre8u5fttxfhllhrjw4e4dl2u2u4dnn4sst6cqr7v2wues22km5',
      token_x: Assets.Fungible.KGLD,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    GNO_XRD: {
      name: 'GNO/xrd',
      componentAddress:
        'component_rdx1czqhyw2njslfmp64zqvxy2rvxpj4ksnfqspsahyypeexfd0nzhk6ys',
      lpResourceAddress:
        'resource_rdx1ngqzcevs722k3v3m5z9a9vthj0fcp56u62vp0sgs89sgpfa6y8nprw',
      token_x: Assets.Fungible.GNO,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    SPACE_XRD: {
      name: 'SPACE/xrd',
      componentAddress:
        'component_rdx1czsskhwd58rwk79h33ryhwsef43k67xlhywzsghx83w97cl0rt0p5j',
      lpResourceAddress:
        'resource_rdx1nfp2ry93h8ewrp9ahwmmgz6x999qn2w0sjejp88yuem9sfcgs93kal',
      token_x: Assets.Fungible.SPACE,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    DDAN_XRD: {
      name: 'DDAN/xrd',
      componentAddress:
        'component_rdx1cz42f3kh5usagarj7av5hp5k7q7exzw4ryjwfdwye584pwlxutxd95',
      lpResourceAddress:
        'resource_rdx1n27rlpeskvq2u0th2eddrp07jfdav8zhyn2muzc6pzwe0qzhtnqx2k',
      token_x: Assets.Fungible.DDAN,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    FADE_XRD: {
      name: 'FADE/xrd',
      componentAddress:
        'component_rdx1cqdk53m3jk5l4zrn0nqnexmt0rafhsuaypllgl6qewuqtkj26lrnkw',
      lpResourceAddress:
        'resource_rdx1n2rrzn07vy32tt4amat9yp6n8cjta2ar58w0yhzafthd5xfqn7f9nk',
      token_x: Assets.Fungible.FADE,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_STILLHERE: {
      name: 'xrd/stillhere',
      componentAddress:
        'component_rdx1cq2u9tngl2c2rvk79ha5wm0c9rvqk4q2aacv458e6a4v6kh2wdw63g',
      lpResourceAddress:
        'resource_rdx1ntg97ytwz6j8rv726v5nq5fpxral57hvzhguy4m8v70qfxmmf2tt9t',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.STILLHERE,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    CABAL_XRD: {
      name: 'CABAL/xrd',
      componentAddress:
        'component_rdx1cqs7zr2kf7684lawgp8dtjqp2602ykrk9m6a77u47zcnhjf32l4yzj',
      lpResourceAddress:
        'resource_rdx1ngvmxhednyrlh7w8ysa88qudmcs7as5s3t2de3jdcgp8at9mylxe0c',
      token_x: Assets.Fungible.CABAL,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    RUGI_XRD: {
      name: 'RUGI/xrd',
      componentAddress:
        'component_rdx1cqrapnychfegy38rrlfu6vgr08s4nav0w43re3k52fpqjn0ttx0gv5',
      lpResourceAddress:
        'resource_rdx1n2a7387qsvfuxwtdaetfd8j5ryxkqv0d4mrq9wx974lygye9tzxc6z',
      token_x: Assets.Fungible.RUGI,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_REAPER: {
      name: 'xrd/REAPER',
      componentAddress:
        'component_rdx1czhhhsctctszetps0q8x5j2x7v89h4tjllg06nner4yqe9e6puut5v',
      lpResourceAddress:
        'resource_rdx1ngauxf9dezlaf84vk5xr062vk9cjzt2fmrj9rr0kvhgzl7zp07v4me',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.REAPER,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_HUSDC: {
      name: 'xrd/husdc',
      componentAddress:
        'component_rdx1cq3mup2x8mt5m3dawrjc8f8lgyg6fxjsspe3tnaqc2qk5hegs5rkq2',
      lpResourceAddress:
        'resource_rdx1nfa2pkdnueuutju5nv8xadylz8g5htaxftlqselzah5660u39xpsr3',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.hUSDC,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_GIFT_2: {
      name: 'xrd/gift',
      componentAddress:
        'component_rdx1cr64m34yca8ca4qtkn67hvnwukecldk075nq8ll9mn8xmzll4v66qp',
      lpResourceAddress:
        'resource_rdx1nfmjwcqajpulzqv80flcv38clcm3ys7n2je5y66xrpch38hmd8c0fm',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.GIFT,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    DPH_XRD_2: {
      name: 'dph/xrd',
      componentAddress:
        'component_rdx1cz503dxywt2tgpk6fl4nhdmfr22wny8wr69f9tnywpa5npgpgcf6gm',
      lpResourceAddress:
        'resource_rdx1ntsw8fyypsxm680qxemqpu9397uskmnzawrdwm5s2dh5sfz76vzfgl',
      token_x: Assets.Fungible.DPH,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    SINX_XRD: {
      name: 'SINX/xrd',
      componentAddress:
        'component_rdx1cz78j3ksvy8avdy3e4f93sltsxkeylld9s06k9dk5memj6ppvf02e0',
      lpResourceAddress:
        'resource_rdx1ngkzra5k0744tcr58w5f5dlqyt3mt3pk0u44dvyf0fu92fegv969kn',
      token_x: Assets.Fungible.SINX,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    RBX_XRD_2: {
      name: 'rbx/xrd',
      componentAddress:
        'component_rdx1czujtfe7vrry8ql223r5s3j55y9f4uwyp3z5qt8ruvlhq5ntcfgxfm',
      lpResourceAddress:
        'resource_rdx1nf9kdxcf7arzr8pzv58ye2cq9h732eecqphjlzsyyfj6csw6ffsfft',
      token_x: Assets.Fungible.RBX,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_XETH: {
      name: 'xrd/xeth',
      componentAddress:
        'component_rdx1cz4ua57z7guqkgtg2hrsgkan0a9m2ctlvlc4zc3hm0nyralyyuqwjc',
      lpResourceAddress:
        'resource_rdx1ntfzpwjml3uydgp3za5c3rjqlsx0sq7m7jggke8qk9ym8kdss7e5vv',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xETH,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    EARLY_XRD_2: {
      name: 'early/xrd',
      componentAddress:
        'component_rdx1czs5ayspcyvgxz5wdwxkrxyt2cu2rnfyneqm9anmdjrsvmk2y0f8vr',
      lpResourceAddress:
        'resource_rdx1ngw6p8k83yuzzhxx4s7jyjnqx83gxaf430grqt7pfr0gwnf9tedpr3',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_PLANET: {
      name: 'xrd/PLANET',
      componentAddress:
        'component_rdx1crj6nhfmkyes8mgmkjgavyexzhnzytm05vh2cet07x287cw45g0lcc',
      lpResourceAddress:
        'resource_rdx1n2c4603cr3j0jekdgln9h9vkvwrrpsk2ssr2e7h3e9qxkxgq66hn0v',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.PLANET,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_SHARD: {
      name: 'xrd/SHARD',
      componentAddress:
        'component_rdx1cpspv04pem87eel8g5dd4jlu9j95wujepaxqdl5k049hq88p7shlxr',
      lpResourceAddress:
        'resource_rdx1ntxgd2w7ks2vyldusvqyj9d7kg2l8vu6hc2rxgwg8qrp8txjcjfkv3',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.SHARD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_DEXTR: {
      name: 'xrd/DEXTR',
      componentAddress:
        'component_rdx1cr6ujqzqgp25ajflnnzn3kmxn8rk4523eqwmj6fequpzej48rqe8lz',
      lpResourceAddress:
        'resource_rdx1nfj59gw7wzqv3k305v4h58q4da25jpata609ufz5z2hakr34d0ewzr',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DEXTR,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    SCRYPTO_XRD_2: {
      name: 'scrypto/xrd',
      componentAddress:
        'component_rdx1cz27h22x79qdc3wts87tzuc0xw2huj8z7a2e25upfq762k43hmaghk',
      lpResourceAddress:
        'resource_rdx1nf4afxfcdugvkz9g2zls9gc7gku3d8xhpmtlf8t3f5n7skdahl3k0f',
      token_x: Assets.Fungible.SCRYPTO,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_PAPER: {
      name: 'xrd/PAPER',
      componentAddress:
        'component_rdx1cr654hzwyk6jjr9lgn65qux280kjr6zl7unxgmzxg4vrkdl9asy8s2',
      lpResourceAddress:
        'resource_rdx1n23fjcl0fztfmhpc8rycxduuct78v3eksdhmpc3f092gt2ekrwd00k',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.PAPER,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    PENNY_XRD: {
      name: 'PENNY/xrd',
      componentAddress:
        'component_rdx1czmqszngstkep8kh0c0pwt0wwyslqfa027mrkg54rucag74jvfjvjr',
      lpResourceAddress:
        'resource_rdx1n2zaymcuh9dhze42wu3cx7ajasykxwcm5tanc6m3cjxdq8r6jctdv3',
      token_x: Assets.Fungible.PENNY,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_LSULP_2: {
      name: 'xrd/lsulp',
      componentAddress:
        'component_rdx1cr5q0nf65zw9n4lehdvuxdrrw4rt0xldtlew77xt8llxwxatghp89j',
      lpResourceAddress:
        'resource_rdx1ng9sk20est2hc2dqtgszlxf3fa9d9h63lphqx0uxapz23p34jlwck9',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.LSULP,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    EDWED_XRD_2: {
      name: 'edwed/xrd',
      componentAddress:
        'component_rdx1cq7k3y9l3a80pavqm7ayxn8tjv3h2cw0n9tlsuzue3kllp6qasndm6',
      lpResourceAddress:
        'resource_rdx1nt6k203t28xzj8mntr0ajg67aqclf9jacum7kj65u059nd8tv88taf',
      token_x: Assets.Fungible.EDWED,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XUSDC_XRD_2: {
      name: 'xusdc/xrd',
      componentAddress:
        'component_rdx1czx6mxv8zkufck25yd6asx9u8vj8qqdjpnn3gmyhr6f3ecq26gnjha',
      lpResourceAddress:
        'resource_rdx1n2fl0pw5gln35yaystnlgskv9tdcuasadqxy254k9r6v9k67xuke29',
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_DUCKK_2: {
      name: 'xrd/duckk',
      componentAddress:
        'component_rdx1czrd2rs6nmtfh2ax3hm7y6dcegqhwuy2le552antuyu24atch5yapc',
      lpResourceAddress:
        'resource_rdx1ngh4kujaetz4frkkvhhu7gnrn909sgyv7a2vy2e7es59skjg5f990q',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DUCKK,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_XETH_2: {
      name: 'xrd/xeth',
      componentAddress:
        'component_rdx1cqxz6066pc0dt3rp295x2ryrxhv7er0knxe4tmvmmgswxr2gehaajh',
      lpResourceAddress:
        'resource_rdx1n2r2zzeqj2sryw50hrazjxwaddy79pg32t5vm6v6yt3e4y027hunmu',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xETH,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    ASTRL_XRD_3: {
      name: 'astrl/xrd',
      componentAddress:
        'component_rdx1czgrp6pe35scqatf34gkq5cv983p5klyj2hfguee38ywrcc9jm9kmz',
      lpResourceAddress:
        'resource_rdx1nt6uw98vycp7h6sn857x5qw2y4mf2qq0thxfha30zetr4qk5f5pvs2',
      token_x: Assets.Fungible.ASTRL,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
  },
  basicPools: {
    EARLY_XRD: {
      name: 'EARLY/XRD',
      componentAddress:
        'component_rdx1cz8p5lc8vmj96hdguy02hkfq4z5xyxf9k759dj8ym8exj8x8zgmw9p',
      poolAddress:
        'pool_rdx1c5hm2rt67scp22pq6tpkfg6cd22g0wwz88065wsy9gdfnd86sv3t4t',
      lpResourceAddress:
        'resource_rdx1t5362v5zqsfkfe38uyl368edpsdm23u5g69qt55jn0ye8nf6umnnv9',
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.XRD,
    },
    OCI_XRD: {
      name: 'OCI/XRD',
      componentAddress:
        'component_rdx1cz89w3ecvh9jvdd892vycs44rr042lteg75zgdydq9csn5d87snvdw',
      poolAddress:
        'pool_rdx1ckyg8aujf09uh8qlz6asst75g5w6pl6vu8nl6qrhskawcndyk6585y',
      lpResourceAddress:
        'resource_rdx1th7ew2u9c9t00xhk34efm9uj8zxnme48h4ypuerv5uu4ftz8j82gdm',
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.XRD,
    },
    ILIS_XRD: {
      name: 'ILIS/XRD',
      componentAddress:
        'component_rdx1czfuwcgnn7dxjjmz9zcacr347ahkuguz7vr9mcdkmywldg0f7qlylp',
      poolAddress:
        'pool_rdx1ck0daslg9anw64t5ytq0g4svmuj85jwvrrhgz2005exh8gt6qxle4w',
      lpResourceAddress:
        'resource_rdx1t4vvunhvl24nrc8hh99dujuumyllvvsurvu72keaeh74e25358nhah',
      token_x: Assets.Fungible.ILIS,
      token_y: Assets.Fungible.XRD,
    },
    WEFT_XRD: {
      name: 'WEFT/XRD',
      componentAddress:
        'component_rdx1crvtvnr02f5fl49jvap4rndlepfsgta455wcyteacr7dtfgzvqqw6n',
      poolAddress:
        'pool_rdx1ck5w5vnm6qwrmcp4way3wtyjztk7armjea3xc5xaktlk9r4gq6s3ee',
      lpResourceAddress:
        'resource_rdx1th5slwxk8x8xs7438ek6kp7kvrz5lxuu823tql4dqvd92q2fzxr3aq',
      token_x: Assets.Fungible.WEFT,
      token_y: Assets.Fungible.XRD,
    },
    WOWO_XRD: {
      name: 'WOWO/xrd',
      componentAddress:
        'component_rdx1cpzydtpn2pvq5xp584mk5hz0nakq4dr5e6xv8mwhpuzd4flu6t2jv5',
      poolAddress:
        'pool_rdx1ck7q3g6gwmfjdzgvl6nmpkrwx5clvl6rp6hnv0tvxsadsetajgu2na',
      lpResourceAddress:
        'resource_rdx1t4ujaludtcppy4ynqmjqycnez9zmyny2c8nkk7gy3xfnxpq0n54sma',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.XRD,
    },
    HUG_XRD_2: {
      name: 'hug/xrd',
      componentAddress:
        'component_rdx1cr8hdtxhz7k6se6pgyrqa66sdlc06kjchfzjcl6pl2er8ratyfyre8',
      poolAddress:
        'pool_rdx1c57rem0vrrv3wh7c5cjz63ww7se0a3cu9f7zd8az2qxtphgu72r0as',
      lpResourceAddress:
        'resource_rdx1t5suu53gjzj2fx2tphgeqk4z5k2mygjw2fr7gel6vpxqw50hwpnvny',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.XRD,
    },
    XRD_DAN: {
      name: 'xrd/DAN',
      componentAddress:
        'component_rdx1czfjhhkhtu0mkjd40vrd6mf3ef2thgf9l7mq5ryktu3ae3vu7tpmzn',
      poolAddress:
        'pool_rdx1ck7dh96cyw8lq6wt3p7upjnhujhqj2c24am0eey35tyq5gv5mjc6ln',
      lpResourceAddress:
        'resource_rdx1tkgkhttp2rjk6uxld8psgeeczfh3jf8253wjgvhprh2v3d943y0tfd',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DAN,
    },
    XRD_MOX: {
      name: 'xrd/MOX',
      componentAddress:
        'component_rdx1cqjd5w6t5rr3zq0kc0ewpe2gy4f9vnqrq0fz3594ta7x9d04t2ttpk',
      poolAddress:
        'pool_rdx1ch0rsxc6gen7jwf6xp02q77c3fywgmhp0xaq9c3m0wk6wu5tdj3eh4',
      lpResourceAddress:
        'resource_rdx1thkwr8342wd5fajn0x6njlrkzvrjey0k5ghhetxrd43u50jv8jqz44',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.MOX,
    },
    XRD_CASSIE: {
      name: 'xrd/cassie',
      componentAddress:
        'component_rdx1czykap0neh96zhjr26a0jwce7wqa4w75tdu6aavqs92dtnztu4kuvw',
      poolAddress:
        'pool_rdx1ckmhzwhx6s789jmrvq2egnz55c7ssf4al2l784ayzv78vem0cygus3',
      lpResourceAddress:
        'resource_rdx1thryexfjdzydgfc9c924edc64fm66z0al6pmz9pgz35jmkx234mqst',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CASSIE,
    },
    ASTRL_XRD: {
      name: 'astrl/xrd',
      componentAddress:
        'component_rdx1cq7tc2pgyzawwjp4qf7ddfeq36scmkghmgl7ww4zp9tqpjuc452mp7',
      poolAddress:
        'pool_rdx1chccz7xl280el9s77uhlcy76ldt5ysvd6gxrgu4tjgrw3rrmqmj3e6',
      lpResourceAddress:
        'resource_rdx1t5e99f88nkmvx38nmg6s48m5et9zxavqaxyxpv043kavu2n64pffpk',
      token_x: Assets.Fungible.ASTRL,
      token_y: Assets.Fungible.XRD,
    },
    EDG_XRD: {
      name: 'EDG/xrd',
      componentAddress:
        'component_rdx1cpnemmzq2hsadw5xnshzwght38mnjrajdffq4vqf3rxqshe5rlv9gs',
      poolAddress:
        'pool_rdx1chrlhpy9cqmyd2qusazwxyvrz9x6s4q5eyjk8ype0tr5j553c2v2dp',
      lpResourceAddress:
        'resource_rdx1thyslkmgs4klav4xc7snduxlkw268axpa525a4kg0jajn533ztysfw',
      token_x: Assets.Fungible.EDG,
      token_y: Assets.Fungible.XRD,
    },
    IST_XRD: {
      name: 'ist/xrd',
      componentAddress:
        'component_rdx1czaf2m2ufjke2dfh36runh7fg3dvchcz42ca0kjgunnk3e4scx2lav',
      poolAddress:
        'pool_rdx1c4hc7fjqv27qfhhqmzduwmvw3ee770aejhycwk0e40rc2d33xahc7r',
      lpResourceAddress:
        'resource_rdx1th2svqwtja5u3pfn0yernqxcy3q0skpf9rs7atp0tv0p80dnpak3lx',
      token_x: Assets.Fungible.IST,
      token_y: Assets.Fungible.XRD,
    },
    SMK_XRD: {
      name: 'smk/xrd',
      componentAddress:
        'component_rdx1cpyj3sa49qsewev9tkzngcdzur7xydrwwkhxjx6xfp46ku6j557sdr',
      poolAddress:
        'pool_rdx1ckuufjljjscaplej7gvdqg4hhs4gh2y4gl5ehm7x8kapec57nrs7ru',
      lpResourceAddress:
        'resource_rdx1t4cev0a4n3spv4qjcu3w2d8w3qtc978h8t45hckf3jzm9cufcr3z0p',
      token_x: Assets.Fungible.SMK,
      token_y: Assets.Fungible.XRD,
    },
    XRD_IDA: {
      name: 'xrd/IDA',
      componentAddress:
        'component_rdx1czcwkeydhz2pjzar6lefw5v0gq8lurc92fdl3rhnfc4kpwvegzzhss',
      poolAddress:
        'pool_rdx1c5634untq7qg3j5pf2kekk929utkqy09sxcsxze8zrxq28sqwshshq',
      lpResourceAddress:
        'resource_rdx1t52dvcujv85uj2zklykn2amf95u3c558theg6r7ewprqhz6eaqjvqg',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.IDA,
    },
    DFP2_XRD: {
      name: 'dfp2/xrd',
      componentAddress:
        'component_rdx1crw3x8qef9kskk524cz9euhwpaqw7l22t4s6lcly6zxsdhzt9qy637',
      poolAddress:
        'pool_rdx1c4rcj58mh6kcf2wsvcap0zj9e42hcjz65me5dk73mjzjy3qep5yvxa',
      lpResourceAddress:
        'resource_rdx1t4tz50azduex9ka66cszd62xwv87gjsh36lrvyz49dnwr2m207tq4e',
      token_x: Assets.Fungible.DFP2,
      token_y: Assets.Fungible.XRD,
    },
    HIT_XRD: {
      name: 'HIT/xrd',
      componentAddress:
        'component_rdx1crryp022aus6ny6fyqrxyhkqjvpplvt5dq0h6taz0mfwypdr84ka9w',
      poolAddress:
        'pool_rdx1ckts6umxedkv9dfxujc8qllhnrv54vdxhetaypnfvzkx67wg3xewf6',
      lpResourceAddress:
        'resource_rdx1t5chers6n8c67n6kx3ul0ga39r3w3428zkt78ywh02l49f963q0f53',
      token_x: Assets.Fungible.HIT,
      token_y: Assets.Fungible.XRD,
    },
    XRD_DUCKK: {
      name: 'xrd/DUCKK',
      componentAddress:
        'component_rdx1cq4nqk0zpvvh23mcvkgpvaa4zzgrt2gkm5th0rregc6awwgsgnjjy8',
      poolAddress:
        'pool_rdx1c4xaekq0tggk5l2ltzeh49kmtksxskm3esf77t0hnt55xssru4knnp',
      lpResourceAddress:
        'resource_rdx1tkul7l9m6trx2rcty8wz2el3salau48zn7683jtfg43c04ee83hyv9',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DUCKK,
    },
    XRD_CAVIAR: {
      name: 'xrd/CAVIAR',
      componentAddress:
        'component_rdx1cp4xn8563xwuxuj5fzw2px4k4uc253ldzdww7aa8mhk7wy5fv70eh4',
      poolAddress:
        'pool_rdx1c4fvlcem7vngzr60gg89s8ggyady34g8qa5ayhdsz8ksv3ph942dl0',
      lpResourceAddress:
        'resource_rdx1t5guwdcckhzaq4huz7005wukcsugd9ev4q9zwywxlzg2pwstmgdfx2',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CAVIAR,
    },
    XRD_CHUG: {
      name: 'xrd/CHUG',
      componentAddress:
        'component_rdx1czkeqn9cxtzhs7nzn7fl0hmked8mje8lz5pwv6qqyltqmkz5eq8u7m',
      poolAddress:
        'pool_rdx1ckefjjguzu45lcpwa0ntc8tfgeuhzrdjgc5y5q023gpvl9d57khu56',
      lpResourceAddress:
        'resource_rdx1t47t0njmd5cn0rn0ftg2kghxc8kxk86f49thznnh26nl8h0ydyq9fd',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CHUG,
    },
    RWA_XRD: {
      name: 'RWA/xrd',
      componentAddress:
        'component_rdx1cpg6pcv6hnpzwgm3hfuv2pvtjt4jc7kx00snpfa8ll5ym0trks2fz3',
      poolAddress:
        'pool_rdx1c4e28yud8mg0zkat028n2u62uahptz8ffxae97296c4wl2u6raem5k',
      lpResourceAddress:
        'resource_rdx1thktcckd7ghcfatrfauj2zwjevyj3dmwptncemts8823xkjmy388a6',
      token_x: Assets.Fungible.RWA,
      token_y: Assets.Fungible.XRD,
    },
    XRD_GIFT: {
      name: 'xrd/GIFT',
      componentAddress:
        'component_rdx1cqf8k9my52cf7uqpz00m7vs7dlflk00n7yz96h3p7u974mfa7zecx9',
      poolAddress:
        'pool_rdx1c5h9ncrt9wmlj5vtgkr02prprphmnlx97fpkzc4gmz8xzg5se9lt3k',
      lpResourceAddress:
        'resource_rdx1t5mg5ac2yfcwc8vrkzhxu4ryfx3tvdjstn29z9ge4praarwr8vm0k0',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.GIFT,
    },
    FLOOP_XRD: {
      name: 'floop/xrd',
      componentAddress:
        'component_rdx1crmhyn4m3u3pxpx74lafpz5yyjtlyupx8duqcct9f8gx0tqqqjvc4q',
      poolAddress:
        'pool_rdx1ch56t5mztc4h0glwsxrk0lrc7w7qyzqa2083u4nzf0a84sxpvf0tt5',
      lpResourceAddress:
        'resource_rdx1t4832rmztxfrgm5n9dr0phjv6qahvlqykql56rd26qpwuxpt992ftl',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
    },
    CRUMB_XRD: {
      name: 'CRUMB/xrd',
      componentAddress:
        'component_rdx1crtmyyhpjjf2am00yu9j3v2l9xlkk5l92kst8fn2dq40gx46v4vtrn',
      poolAddress:
        'pool_rdx1c542d2w2je04hh0q7y2fdvu0l82pfkt89f8rtltyk0lny82s0aj8lm',
      lpResourceAddress:
        'resource_rdx1t4vm6kpgqhezxg7j3vwn68ckefew7v053t7nfgm90pu9euapucsuy3',
      token_x: Assets.Fungible.CRUMB,
      token_y: Assets.Fungible.XRD,
    },
    FOTON_XRD_2: {
      name: 'foton/xrd',
      componentAddress:
        'component_rdx1crvjuhghytwjpc24nrthqjqjgzxga8zm7zcn5l2hr74tswpz2quy40',
      poolAddress:
        'pool_rdx1c59jpe57uhlpcslfjh4lvkmgdx0pchdr3py6ncncm6x9trpg82k47w',
      lpResourceAddress:
        'resource_rdx1t4qhd5m0z0wgqhc522j2kmshxpt9hha9n7rw5espdr3m7uljdn83jh',
      token_x: Assets.Fungible.FOTON,
      token_y: Assets.Fungible.XRD,
    },
    FOMO_XRD: {
      name: 'FOMO/xrd',
      componentAddress:
        'component_rdx1crrswdckzs927y9072qw3jss04p79aucd2ntvwkk9klsd2w6usj6hd',
      poolAddress:
        'pool_rdx1ckslcv8xe900rkr92922efgqgf0uk9h0hhacaexm2e2a04l8j9hslc',
      lpResourceAddress:
        'resource_rdx1t5zx7dvhkr52znsgnuv068devaj78jdpdljryqzwfsg63nnj0294hk',
      token_x: Assets.Fungible.FOMO,
      token_y: Assets.Fungible.XRD,
    },
    DGC_XRD_2: {
      name: 'dgc/xrd',
      componentAddress:
        'component_rdx1crzwkqxx5vcuqqqedkmsgvw4hglrtyun8ksmj686yj327yy5a70f6h',
      poolAddress:
        'pool_rdx1c4x4q8d5hdfs284f9g3hln5qqp4vs8wjh56n2wpw5ea8e3hqft3uar',
      lpResourceAddress:
        'resource_rdx1tk2ucjzhg4entzmwyurn990cyeq35exnk7lhnug3rvqdh9z7m5xs4x',
      token_x: Assets.Fungible.DGC,
      token_y: Assets.Fungible.XRD,
    },
    XRD_MXRD: {
      name: 'xrd/MXRD',
      componentAddress:
        'component_rdx1cpcd7jj698z85d2u3xk2kuk53jys0hlyprmyrxfeexw5pwqz4rhadh',
      poolAddress:
        'pool_rdx1c5jylcck9h7pesczr6tass8jsmnujku6hajyxdtkj7m6rlhps57kpw',
      lpResourceAddress:
        'resource_rdx1tk53wh6g58mfpjc3u94ag6vzxaxhfqje7cg7gz5mdpdfk3249s5ann',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.MXRD,
    },
    MNI_XRD: {
      name: 'MNI/xrd',
      componentAddress:
        'component_rdx1cp05j865syfmv0uknk8hgg6anrs299cgau2x3w8lxnzqxgd63a6d5s',
      poolAddress:
        'pool_rdx1ckav94kw3ltam0l6nddfl0xzdd6atw0nf8feu7wean3yjrcug6ep9k',
      lpResourceAddress:
        'resource_rdx1t4ssu5d6jcuhctrvl97er9n4w0pydvqyjr6kzmjspyteg5gx68298w',
      token_x: Assets.Fungible.MNI,
      token_y: Assets.Fungible.XRD,
    },
    DPH_XRD: {
      name: 'DPH/xrd',
      componentAddress:
        'component_rdx1cpp299rjy4gyprveu7y5j8u993e9t74xeu33tf6kurlpslqg4vy7m5',
      poolAddress:
        'pool_rdx1c4drahjct9vwprr9ypsn6z60rp7rmn04txppmw0jpwa3w3xtmxv7u6',
      lpResourceAddress:
        'resource_rdx1tkpevy7ysc29j4ftja3djnt9z27eh5cgarprgt2wagpuxr67qg7u4w',
      token_x: Assets.Fungible.DPH,
      token_y: Assets.Fungible.XRD,
    },
    HYPE_XRD: {
      name: 'HYPE/xrd',
      componentAddress:
        'component_rdx1czl2fj59kcpr4s7qzgty742andd7entelldraq0ddk22tk3j83zhxf',
      poolAddress:
        'pool_rdx1c5uj0dwfneg0p07smdd3g9ww0napnv3kdp6lx7cpylxa333v2225st',
      lpResourceAddress:
        'resource_rdx1t4zlxc5ymksr2wl6thatluzhy8c5q4vk44m5yzp8yuly72m20vee7m',
      token_x: Assets.Fungible.HYPE,
      token_y: Assets.Fungible.XRD,
    },
    RAM_XRD: {
      name: 'RAM/xrd',
      componentAddress:
        'component_rdx1cz5zjm4exy2ejytfjv8s7934sw9l2h00rz8fqh02t3wr39gpnqxwan',
      poolAddress:
        'pool_rdx1c5rh09tgleet66t5k484k5m2nxtpal5gt0kavqgutd2tqfu3exrdy9',
      lpResourceAddress:
        'resource_rdx1t5u7wkaa0276ej2num3cx8qxeh4p2fl2ypazeew6tytfru8pvs7gzu',
      token_x: Assets.Fungible.RAM,
      token_y: Assets.Fungible.XRD,
    },
    XRD_SRG: {
      name: 'xrd/SRG',
      componentAddress:
        'component_rdx1cqwuupt64ads9jj5rvmzceykj2z0r3tenrkldpp49crfc89w20d70x',
      poolAddress:
        'pool_rdx1c587dvtqvvpvxdp30kd27zqfzffustfgcxtzk77puxeckuv9rxd2z5',
      lpResourceAddress:
        'resource_rdx1tkl2lw7mjrvwcsuymcdknrpsugdggzmceqd77kcp4c22ysk4grym0m',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.SRG,
    },
    SLFI_XRD: {
      name: 'SLFI/xrd',
      componentAddress:
        'component_rdx1czzgsthpug8xu0wlt9westfa3msv8zqr9y3sjcvaxl3p85j77t2ev3',
      poolAddress:
        'pool_rdx1c4kvtxefdas7stxtc60c92un2zjdvz8ulmmwfk2z2re3g64a8wwtna',
      lpResourceAddress:
        'resource_rdx1t5z3w3kzw7ggzpp09xh6e4ade2ux4uk053lcy5g208qt0p5w5wuwge',
      token_x: Assets.Fungible.SLFI,
      token_y: Assets.Fungible.XRD,
    },
    GNRD_XRD: {
      name: 'gnrd/xrd',
      componentAddress:
        'component_rdx1cz677mtwpgm8rce35jjfr23ld07ld6zwd8u6wxcfhu6u788g06vlpd',
      poolAddress:
        'pool_rdx1c4a5yalpnya3q4ggnujxl4fzl7ehwra0dmjhy8lnhqc9g0fap7tlf8',
      lpResourceAddress:
        'resource_rdx1t5ncpr6m09pthly796758a8hwzve08gvylxcl63l28v7ehgfc3478n',
      token_x: Assets.Fungible.GNRD,
      token_y: Assets.Fungible.XRD,
    },
    XRD_FLUFF: {
      name: 'xrd/FLUFF',
      componentAddress:
        'component_rdx1cq8gnwdn8lhzqpu9hv3qhexkfn9uewclunhdrumkeqt62mcz9l9hkj',
      poolAddress:
        'pool_rdx1ch632y6uruxayq8snud7t6d666fe9xsxuhuzwf09p5xwuhtz9x97s0',
      lpResourceAddress:
        'resource_rdx1t5pe5pzgssa7r55lyzc58lwn5nhufkfkxrazyznwhphkzhyg9w3zrv',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.FLUFF,
    },
    XRD_RADIT: {
      name: 'xrd/radit',
      componentAddress:
        'component_rdx1czyfcnn4lwg4cxmt3yz8uhsyqhk267lfjl6j9y4tudt9vmu6ng45nj',
      poolAddress:
        'pool_rdx1chkexlavfyt8792jh38u982kt5sgf6d7pe7qj4jyauphyevkw4mdpa',
      lpResourceAddress:
        'resource_rdx1tkf76uklde0qfpgk93mwc9vf0mf7tvpvkzhll9hrkh3pq97j8phzud',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RADIT,
    },
    MRD_XRD: {
      name: 'MRD/xrd',
      componentAddress:
        'component_rdx1czzkznv8jqk2qhj8avstyt63uw0f6ad08gzphgflh6fs6kcwpwrsx3',
      poolAddress:
        'pool_rdx1ch8nqtsektlsnzkj4p4chp48tdrf39nv0sp6cv0jv9clxkm8339ks2',
      lpResourceAddress:
        'resource_rdx1t4hr4gf66ex9rtjfn6eku3p6ztfhu7zp7ylr573c8qa3l3n79svt8c',
      token_x: Assets.Fungible.MRD,
      token_y: Assets.Fungible.XRD,
    },
    EDWED_XRD: {
      name: 'EDWED/xrd',
      componentAddress:
        'component_rdx1cq6jj50md7px03w0rkgjpa8m7gwjl2hlgg8hlcpje8rdw4qugm768z',
      poolAddress:
        'pool_rdx1c46tuzhxuv7xxmvrm4cepwkeg40xqh5rnjc4tmhnpe4xxkxjp9xjnw',
      lpResourceAddress:
        'resource_rdx1tkckdafw5a2zw687p5vhnqluqduf26u9ns6dj23f4l8pqk8ae65mtl',
      token_x: Assets.Fungible.EDWED,
      token_y: Assets.Fungible.XRD,
    },
    XRD_LSULP: {
      name: 'xrd/lsulp',
      componentAddress:
        'component_rdx1cql8p2x2ycsyt768au8npkp0dw7mnsqv6gj4krc99mssmqhu5jcs9m',
      poolAddress:
        'pool_rdx1c404nlszaaswcv67eljad6jgwygydt0qqlv84h755tdly7h0pvym3e',
      lpResourceAddress:
        'resource_rdx1th2vpu0p05uaz9p4m95x63kcjw0sjx705xzhac9x7xqaqr57m4nlu4',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.LSULP,
    },
    FOMO_XRD_2: {
      name: 'FOMO/xrd',
      componentAddress:
        'component_rdx1crvll3s2h8y8c6dju68wfqewy046hurz2gaqx80h2733dm63ac0zjn',
      poolAddress:
        'pool_rdx1chf5z7gt05dgy6uyfv2lrxzu9h972qza8ap6x5cfs87x3w47vnc60t',
      lpResourceAddress:
        'resource_rdx1t5yrxxweypslde3hl6k7as48uth75u7mpmdwv8gla9njcgm6t7zqhd',
      token_x: Assets.Fungible.FOMO,
      token_y: Assets.Fungible.XRD,
    },
    XRD_RDL: {
      name: 'xrd/RDL',
      componentAddress:
        'component_rdx1cpz6qkcxpz2qxuvakjmy3znuxg7fgpuwjp07wt53u6x92kl60zc9m4',
      poolAddress:
        'pool_rdx1ckxwxl8lqcjhdc2savwmscquujas2ptfznldjqy7ahc49y8h79w0fl',
      lpResourceAddress:
        'resource_rdx1tk2rty5tzrmmw5yfv75p5v753yt2nfscdvpnp9z33sxn2txx5nzznr',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RDL,
    },
    OCI_XRD_2: {
      name: 'oci/xrd',
      componentAddress:
        'component_rdx1cz3gcns9krar4l7gu6337q6wqd487ev79f06wnv0wwgvrrlajssttq',
      poolAddress:
        'pool_rdx1c5shqw3yq5s7l6tr2k9h9k68cqsju9upr2wq5672rw5gt6y5s6rypj',
      lpResourceAddress:
        'resource_rdx1t53cw46nyfqj96u5p6zpegjxrynm4n96nwe53msnegwkyfsu4230dz',
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.XRD,
    },
    DOGE_XRD: {
      name: 'DOGE/xrd',
      componentAddress:
        'component_rdx1cqgwsn2dxuf6x7m38yjv9nagpxht322a97ya4xjvlrgyasfvslfxvd',
      poolAddress:
        'pool_rdx1ckpfpnsl2q7cu4japgv7pzta4f4gvqf6wgrjh9r7swcnvkzrj0vauf',
      lpResourceAddress:
        'resource_rdx1t47kxqvrzfj8vl4f2tpm0d9fy8gjt74nhxn52g33tu6urlgh0y3kuf',
      token_x: Assets.Fungible.DOGE,
      token_y: Assets.Fungible.XRD,
    },
    BOBBY_XRD: {
      name: 'bobby/xrd',
      componentAddress:
        'component_rdx1cq8k0447m3wjjh68q6lncv92tlndawxvt4dh3dmu8eus5yef82tf7m',
      poolAddress:
        'pool_rdx1c4xj8nq6ajj5pffhzs6fksfxfxq44nuyva299nylxpngvnmpm7awmd',
      lpResourceAddress:
        'resource_rdx1t5lppjlwk4t92awhqnu9ld3sjfaf2pannnj7j2gulhmgg96746dhce',
      token_x: Assets.Fungible.BOBBY,
      token_y: Assets.Fungible.XRD,
    },
    HNY_XRD: {
      name: 'HNY/xrd',
      componentAddress:
        'component_rdx1cqjemddtdssdm3agdfauw9p9tpa429hqkrdd6pv6cjhe3z3pcrlrtq',
      poolAddress:
        'pool_rdx1cksyg8x6wle8wr2a5rhvlf2c24pg8r40ukluez3ck4nrlwn3qs82d6',
      lpResourceAddress:
        'resource_rdx1t4c7d7w0p50zuxx4vpkmslpy9w6zxm547lqyulcz5nzsl8p9lf537n',
      token_x: Assets.Fungible.HNY,
      token_y: Assets.Fungible.XRD,
    },
    DOUBT_XRD: {
      name: 'DOUBT/xrd',
      componentAddress:
        'component_rdx1crzhup96ya5tj59kly048jkef958fv9vv353j578wm0rvwhlx7yrle',
      poolAddress:
        'pool_rdx1ck679vt85deqy8cupzash4zql487eehylk5n876w0xzh2039wp4ymh',
      lpResourceAddress:
        'resource_rdx1t48c04wsew5wfxwtzupu94sy920lwwfyrdvsjhamermf3a2eeqs4pj',
      token_x: Assets.Fungible.DOUBT,
      token_y: Assets.Fungible.XRD,
    },
    ICE_XRD: {
      name: 'ICE/xrd',
      componentAddress:
        'component_rdx1cqnvndf6ftaq4qfndkqj4n5jxc53tt5zylzqk2z8udk6es6p586z6d',
      poolAddress:
        'pool_rdx1ckfsue0rcr3tw2qzf4hhkzg47yuk6pd6zeuztjtuhyxfw0u7zy3c05',
      lpResourceAddress:
        'resource_rdx1t4m529encpnrzyhfuh4t8jpqqayj8ttnrhg7r6qu8zx7yzxkctskxj',
      token_x: Assets.Fungible.ICE,
      token_y: Assets.Fungible.XRD,
    },
    XRD_KISS: {
      name: 'xrd/KISS',
      componentAddress:
        'component_rdx1cqtwsgk2shlgmk04h62gx3m8erxj90rt67y2j2z7jc4wefekv3zk4x',
      poolAddress:
        'pool_rdx1c4kq3qd3zy6vhfqwvk6kfpweh7gnu30efvkrcgse07w827m4ymap0q',
      lpResourceAddress:
        'resource_rdx1tk8nn7fss033dj7jk3g0e23e8yhw9xs5c4kmrfpm9fjdznpmggez34',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.KISS,
    },
    BOB_XRD_2: {
      name: 'bob/xrd',
      componentAddress:
        'component_rdx1cr927aeavysjpqgh4rdtqc3r5afync0gjt9lecudk7wp4udn4vqc62',
      poolAddress:
        'pool_rdx1c4jxknnsjg8r7m5hj87aurlq9jd2249pxc3d6r3q0w6hhlaz2vl5ft',
      lpResourceAddress:
        'resource_rdx1t4dcg7r2uj8gm440yklx60t9962puz9y6seuj430epjqw78x2w80hw',
      token_x: Assets.Fungible.BOB,
      token_y: Assets.Fungible.XRD,
    },
    XRD_JIT: {
      name: 'xrd/JIT',
      componentAddress:
        'component_rdx1cqw4d8cm293akftr8u6unh3xplsdp4fw0dv80runuft7kwc5ew62su',
      poolAddress:
        'pool_rdx1c446r9suy37kznp8jeju8hmkem7e0tynxgf9hz80v8067kn7a896nn',
      lpResourceAddress:
        'resource_rdx1tkv39698huwy3us8elnndlntl5m3yhrpdh95pv67ddl4ny3gsfygn7',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.JIT,
    },
    XRD_GAB: {
      name: 'xrd/GAB',
      componentAddress:
        'component_rdx1czzc2kztr3cfuu6twpz43vth428jv9a79u0jw2vfresgfh5zpds08d',
      poolAddress:
        'pool_rdx1ckepm8acua47w874f3luw28lv8z2metxtdr7jk77kvxrrcvxjrrj4v',
      lpResourceAddress:
        'resource_rdx1t4knl50feey02lamt2kz0xpz97kv96p8m2ganrqk2jmxwttkpumyy2',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.GAB,
    },
    DGC_XRD_3: {
      name: 'dgc/xrd',
      componentAddress:
        'component_rdx1cpzwe4knu0hauds5mjtnqpaw42g8n5wjs54yw9dlj7v7pjzlkfzlwj',
      poolAddress:
        'pool_rdx1ckqeh0jrf5wx775f42amgnpzmhuxm5upnf8vmkcrh8t2vgr59e95u0',
      lpResourceAddress:
        'resource_rdx1t44edzvtr6ewha90383grxy9gr3nv4djw73g7l5hw3cwf29jdqej40',
      token_x: Assets.Fungible.DGC,
      token_y: Assets.Fungible.XRD,
    },
    XRD_WAVE: {
      name: 'xrd/WAVE',
      componentAddress:
        'component_rdx1cr3jmqxsnfrrwmcma3ns9jvyqeyv8tpk3s09syvgp2dqfjcfezwhh9',
      poolAddress:
        'pool_rdx1ckpxjammf2epjr84qafnkdxj6pnrqy8w0f0p8hcuqquwuhfzqpgr6f',
      lpResourceAddress:
        'resource_rdx1thvwrm7sq50dvmn5343j4zjwyttg34n7gtfdeqv4pfa25hwutwecjq',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.WAVE,
    },
    XUSDC_XRD: {
      name: 'xusdc/xrd',
      componentAddress:
        'component_rdx1cq76gg42k73e9y7fcpy2q6d83nr703fa3xztc7lz5dnw38xkp2l5pt',
      poolAddress:
        'pool_rdx1c550e7e6eexxn7qawsse8lxw6a0a4peggfpaq2cllqd82dc038mzgn',
      lpResourceAddress:
        'resource_rdx1t5kxrpzgsruenyht05lk8avc2ejdezgk987jjenuy5uzrnwdnp9dfg',
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
    },
    XRD_XSE: {
      name: 'xrd/xse',
      componentAddress:
        'component_rdx1czmkflw98drw2y8e34480vx486r330gw4fwh6ehvphfrf89rgqmmka',
      poolAddress:
        'pool_rdx1ck3cxpvq36ptc3nfpynv9g2qrkkxuukusj0ttytcmyk7qhl8q98ta4',
      lpResourceAddress:
        'resource_rdx1t5zw2ustecvvq4tlakrh5t8lu9p0zds9j3vz0usux6gxh8gmmfnuzs',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.XSE,
    },
    DFP2_XRD_2: {
      name: 'dfp2/xrd',
      componentAddress:
        'component_rdx1cpj25l4f8v2n4xl2auhwsagwmt5mmxsavxttmkpl90cr2qnyejqcmt',
      poolAddress:
        'pool_rdx1ckdf4tq62lznn5c3zlkx7paxjth7g2d0ryqhexxzq0yrufmev096nd',
      lpResourceAddress:
        'resource_rdx1th68g9hn0u6u29uv6pqm8qjnd7luhn3nk9x436vvwzdu9vcwqndc2c',
      token_x: Assets.Fungible.DFP2,
      token_y: Assets.Fungible.XRD,
    },
    SINX_XRD_2: {
      name: 'sinx/xrd',
      componentAddress:
        'component_rdx1cp97eh80p22n682c0acstus47u4f426yxsvp49lafkm634llg6gwqp',
      poolAddress:
        'pool_rdx1chp9mg6sdk9yprrtkat5jyuvxndkqxzy5qmnndae6f0mr9edfpzwmh',
      lpResourceAddress:
        'resource_rdx1th2yyngywg3885nckf0wkq7fhy53z7dk3gxgvfetuk79ywx69ltyxx',
      token_x: Assets.Fungible.SINX,
      token_y: Assets.Fungible.XRD,
    },
    XRD_XING: {
      name: 'xrd/XING',
      componentAddress:
        'component_rdx1czzrx90kkk9c96l2v7syxs8lryhym7d8ds22zrfd2fhfpfjszw076u',
      poolAddress:
        'pool_rdx1ckc44vhvwpgpr39qe3t87gyg2fzdt6y4pkx8qvdmrpddjw73ppr55n',
      lpResourceAddress:
        'resource_rdx1thvdw0hrqn7jhh8tanffqyj0kgnkf7sw9e9q9tgp74x6dmlqgl6l59',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.XING,
    },
    FOMO_XRD_3: {
      name: 'fomo/xrd',
      componentAddress:
        'component_rdx1cqvdxpuee2v6uxtt0sqvkphhd83s3fdlxmgpkqfgkw9nergl6w3kgj',
      poolAddress:
        'pool_rdx1c4yeeffq0n9kt9xyrsx803mmm2d50e6kjwcj7j447g63wce6qwu73z',
      lpResourceAddress:
        'resource_rdx1thndhp5cd5wms6kyk6x680a7d97ehss42jcgjevzha3f79ftm3k63h',
      token_x: Assets.Fungible.FOMO,
      token_y: Assets.Fungible.XRD,
    },
    XRD_THC: {
      name: 'xrd/thc',
      componentAddress:
        'component_rdx1cph3cdlwf7qaw7d8hxtmsm0rmenrr62y2jlm7um703rxglpkwjw4ez',
      poolAddress:
        'pool_rdx1chs5mvpdcdv67ekj2t34pz9rjkmcrcwlu629e326r2h9xl5hy8mhf5',
      lpResourceAddress:
        'resource_rdx1t5gz69tpgx5tqlelnllcmdk5f5e47r9ha7scwmqp890ff32e2s2s4z',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.THC,
    },
    RBOY_XRD: {
      name: 'rboy/xrd',
      componentAddress:
        'component_rdx1cr9pkvdqvnj52z7dr4dd2txgjl5w4wdfgh85tflwpgahj76pm4d4ym',
      poolAddress:
        'pool_rdx1c5smnacq8jk6246m9s85trmfftz9n4d2y0ed300s7c879gecxxg39a',
      lpResourceAddress:
        'resource_rdx1th5xy2flg7yt2dygqdy8hjnz8vph9vxmy7nn7wd88zex62uzw0apry',
      token_x: Assets.Fungible.RBOY,
      token_y: Assets.Fungible.XRD,
    },
    DGULDEN_XRD: {
      name: 'dgulden/xrd',
      componentAddress:
        'component_rdx1crl43znlwy3wpm92nj9rmzq8mnza9p4x89q9y2nytxqte5u040n9r9',
      poolAddress:
        'pool_rdx1c4w3tl2yps4d5ckd474zed9vckt7ezz203p7qfjm8ljf6t3uw6aycl',
      lpResourceAddress:
        'resource_rdx1tkj7e5mglmdx34zdxf253jc4kzsj7seg0kf55xemwhspeck5zsrler',
      token_x: Assets.Fungible.DGULDEN,
      token_y: Assets.Fungible.XRD,
    },
    XRD_WBTC: {
      name: 'xrd/wbtc',
      componentAddress:
        'component_rdx1cp0mk8r9jxz8kl4nx6vucr8n80aehg6xhrkyrdhcs6pfz32rnmrymd',
      poolAddress:
        'pool_rdx1c439w0mk4zrjs3lrcnrnsrkxjrmg9ema72rhnr7t93k302x2cf06md',
      lpResourceAddress:
        'resource_rdx1thxl9um25s2t23xl4djxve3qrmvzsvnqah2zsj3gny0a0d5tlsczd7',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.WBTC,
    },
    FADE_XRD_2: {
      name: 'FADE/xrd',
      componentAddress:
        'component_rdx1cqy57x75l8mjtd0vrknrf7xu08rhe7fh6ck2pg4hqv76zpnutt2hv4',
      poolAddress:
        'pool_rdx1c5ka6snffrur5tm736nj92sl2450n5myq4s62e56q8zm6hg0hr6mmp',
      lpResourceAddress:
        'resource_rdx1t4pp9uql6env5y0pklnsfu2fuu4macxe2ysctpcr8v0hslgnvfgtap',
      token_x: Assets.Fungible.FADE,
      token_y: Assets.Fungible.XRD,
    },
    DUMB_XRD: {
      name: 'DUMB/xrd',
      componentAddress:
        'component_rdx1cq09mumvf0hqrgcw69rvdymhml4f6q3ry4fspl347an6ezcwvsksen',
      poolAddress:
        'pool_rdx1c40thv5deaez4wr4frstt939wkljr8p6t0kjmvcv69q88j4rt0c3wj',
      lpResourceAddress:
        'resource_rdx1t42ew5pgxxevptcdpjtjf0luxtxjp70ehe6cklvd79hufmtn8pcu3f',
      token_x: Assets.Fungible.DUMB,
      token_y: Assets.Fungible.XRD,
    },
    STAB_XRD: {
      name: 'STAB/xrd',
      componentAddress:
        'component_rdx1cq7r70y2ztfyx86rn2xq2zdkfaewegrlfze828t4hdj4glfukrxg2z',
      poolAddress:
        'pool_rdx1ch5vndp3ul6fefm9jkrv6cy9nfa05elf8uhs7p77czxuwl3cmjng6n',
      lpResourceAddress:
        'resource_rdx1thu36tgr68gwltct5mzdmcxnmk87mfq7yxzxuq4zh7ftcwt65ur2yt',
      token_x: Assets.Fungible.STAB,
      token_y: Assets.Fungible.XRD,
    },
    RAI_XRD: {
      name: 'RAI/xrd',
      componentAddress:
        'component_rdx1cpe4my6m7qsh5cn8tujtjyg0xl628g9el3vgh89me42pggg80vm8ch',
      poolAddress:
        'pool_rdx1c43etnl67g7gz0qluqxlczdauslmuwud59vm36gg6xugsjwxxtafqx',
      lpResourceAddress:
        'resource_rdx1t5y64qdyjatp7khnj6s7lmy0n4hg8at3u0hkf4hccykdwtkhtm589h',
      token_x: Assets.Fungible.RAI,
      token_y: Assets.Fungible.XRD,
    },
    XRD_WEN: {
      name: 'xrd/WEN',
      componentAddress:
        'component_rdx1cqd2maza7w335dqquljzusq057xej52z75vce7f86jyefsf6wmddtr',
      poolAddress:
        'pool_rdx1ckkc2c257q00q6vhu6ae7rnnlqfj4ud6nzuvs6spledfvql7ap503x',
      lpResourceAddress:
        'resource_rdx1tktk3f8x8v5mphgkd2j8axc00mse92v5jd2r2qnhdk5pes6r0vpsex',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.WEN,
    },
    XRD_WIF: {
      name: 'xrd/WIF',
      componentAddress:
        'component_rdx1cq09a4ct5rxetnmdg24zv8dd9zkep9pxwrun9u5g2fgg5xdwau73a0',
      poolAddress:
        'pool_rdx1chmhh3nz2wjp9hqstcmx3lasfjvnp3z22jxdhutjsv0nr5gt7rjz8t',
      lpResourceAddress:
        'resource_rdx1t5nam6fy6s9twrnrt5p407k8v082whwnttyajmrqjevcqp4tyjjn4q',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.WIF,
    },
    XRD_COCO: {
      name: 'xrd/coco',
      componentAddress:
        'component_rdx1cqytgvr3gzq9rfkn7fcgfv74030kl5unz3l8dpsptp0zaxp2e6z9e5',
      poolAddress:
        'pool_rdx1chpqvfnh844f6r2576x073qpqucndc6q66tlw6u38v6ua8eanc75wu',
      lpResourceAddress:
        'resource_rdx1t59mztqahxsxlh5zglj3uu5djnw6nderftng6ja46wegd7pp6avfjv',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.COCO,
    },
    SHEP_XRD: {
      name: 'SHEP/xrd',
      componentAddress:
        'component_rdx1czgyph39wky5eacgqlkly7y8wval0f2lv3etd4eau289e5tstc9jd2',
      poolAddress:
        'pool_rdx1cketcnaqx3ctkk6pav32z2xkks5wxg4c8ffs6kkx070gxh6e5kmmh0',
      lpResourceAddress:
        'resource_rdx1thy9am4c6q6j0s60uvudnvwzeqs7ftg9z6jj4anajf6l2rrl9scz07',
      token_x: Assets.Fungible.SHEP,
      token_y: Assets.Fungible.XRD,
    },
    RDK_XRD: {
      name: 'rdk/xrd',
      componentAddress:
        'component_rdx1cqfdpnmpkvaawcd0x9ht9ew77cfswmtzrmprxesrt8eq0mwcclgtpg',
      poolAddress:
        'pool_rdx1c5zgqjgdgyw5xunzdr8j9ueue58t866u5maghksf2ha9lz2gk4xv25',
      lpResourceAddress:
        'resource_rdx1t54hf7nvxmg64qyve7wtqhr993ty0wglex8c2gng26rwkxlcle8fvq',
      token_x: Assets.Fungible.RDK,
      token_y: Assets.Fungible.XRD,
    },
    LUCK_XRD: {
      name: 'LUCK/xrd',
      componentAddress:
        'component_rdx1czn9u9s0u4dyjwv9wcv8hhd98hh68w79vgt0eke4c7gtmj8725faft',
      poolAddress:
        'pool_rdx1c4lz9ttyngpya35jjlxzf44g7kc3eu9txdpf9tujjtxdwuftcrt6wc',
      lpResourceAddress:
        'resource_rdx1th8n8zc57hax4zht76h0g093zu4cepyt9yp2t46nkwkmeylqgr0x77',
      token_x: Assets.Fungible.LUCK,
      token_y: Assets.Fungible.XRD,
    },
    XRD_JTM: {
      name: 'xrd/JTM',
      componentAddress:
        'component_rdx1cp6f8fngmclc38ulrv9e8phsglv8vzfeygn76xq4h7qtnqe7jamu2p',
      poolAddress:
        'pool_rdx1c4k9dlggg7edxyt3pya7qjkwgmu55wfmc46fkn5rjg6ufpk5nq6y7r',
      lpResourceAddress:
        'resource_rdx1thqetzklzsc0f6hcw06qcwzwy4gp7mwad0sjn0vrthf0f20fexzhyh',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.JTM,
    },
    CERB_XRD: {
      name: 'cerb/xrd',
      componentAddress:
        'component_rdx1cpq3tdv9ry2nwezsnwu2ld80cjrurq2l2crke82358prvhkc303l78',
      poolAddress:
        'pool_rdx1c5gvsmtqw7turylx6pvyswq83zul68qyvl8hhqqpqjnxt8c6d5p24d',
      lpResourceAddress:
        'resource_rdx1tkmy7020fzzxkq7kqkgvg5trdyscagyxdsjl39gqfhl54r4jjdlzj4',
      token_x: Assets.Fungible.CERB,
      token_y: Assets.Fungible.XRD,
    },
    BALLS_XRD: {
      name: 'BALLS/xrd',
      componentAddress:
        'component_rdx1cz6vnsfalvg7c9h6g3xl7g7eevq8q7t4t824s5jyu5jcjzg9c8p0yz',
      poolAddress:
        'pool_rdx1ckjqu0xym7d74mc5wzlvjsct9g0u7tjgg6fft8024alpjh5anvxrr5',
      lpResourceAddress:
        'resource_rdx1t4xutpr943j3udmkln3xhpr5y58g2r2zgpk4d6htmvveyasypmykck',
      token_x: Assets.Fungible.BALLS,
      token_y: Assets.Fungible.XRD,
    },
    STUFT_XRD: {
      name: 'STUFT/xrd',
      componentAddress:
        'component_rdx1cpenxqkhjzmyyydqxne8dyz87qdzvvrg9dp7vr92pqa7jmal2sjqpf',
      poolAddress:
        'pool_rdx1ckq75zx3fe3x669htd83m7knch7en78a99wjpajhrlj22cxnj07fx4',
      lpResourceAddress:
        'resource_rdx1thj58j3d2spmaqck5qkzm06mmlp8j6y4kmsszcwd50skz737e2s97u',
      token_x: Assets.Fungible.STUFT,
      token_y: Assets.Fungible.XRD,
    },
    DNT_XRD: {
      name: 'dnt/xrd',
      componentAddress:
        'component_rdx1cqdn5l752zlml4t46hapg0fvj4myqph7s7syeaqey37a8tyynsdazs',
      poolAddress:
        'pool_rdx1c4y0gclsxggpefjct6trx4wjsgztwensfa7e22pcnvhr0l3gfat6mt',
      lpResourceAddress:
        'resource_rdx1t5w6zn98xnwl62whzfmtgzz3wzadrxuaq4cd0n8myy9x6qatjkl6xl',
      token_x: Assets.Fungible.DNT,
      token_y: Assets.Fungible.XRD,
    },
    CTO_XRD_2: {
      name: 'cto/xrd',
      componentAddress:
        'component_rdx1cqwydd38h9mejs9edr3axa39c3avm4rqs7cxqxarjh7xxadyzzrcg6',
      poolAddress:
        'pool_rdx1c59j8njfjdvra9r4t204vr5mcjnmvpgezmeq3z0n9exmjty7pwalz2',
      lpResourceAddress:
        'resource_rdx1t5vapz2599n4k0d06q2xccn9kd38ljtw84fcu65nrza0q35h4s80ea',
      token_x: Assets.Fungible.CTO,
      token_y: Assets.Fungible.XRD,
    },
    XRD_POPEY: {
      name: 'xrd/POPEY',
      componentAddress:
        'component_rdx1cq7jc9lcdgqjkqs0sf7xcdrqme36msp7xu24afurg7twguvuhj6fzw',
      poolAddress:
        'pool_rdx1c4nwcfvxz28a3z3pud025wkk5q84j9m0jy2626e8n2q5955hdvzmw5',
      lpResourceAddress:
        'resource_rdx1t5fg8tecxhedr49mtqgm488sd4xpfxdzgyj0ecen85c64lgddl8czl',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.POPEY,
    },
    RDS_XRD: {
      name: 'rds/xrd',
      componentAddress:
        'component_rdx1czn6wn76pjkleqv0u55j78puguas3jufrm5amj9efz0qjxnptl2c7e',
      poolAddress:
        'pool_rdx1chmfed84k0yg70g0w3mgl0fg8h29ew9l249wvcafv2jj4677cusg46',
      lpResourceAddress:
        'resource_rdx1thpahddyel7f7ezch4lud6v8qrqvy3vcav7hgfky3eteyzv0n0etf3',
      token_x: Assets.Fungible.RDS,
      token_y: Assets.Fungible.XRD,
    },
    MEH_XRD: {
      name: 'MEH/xrd',
      componentAddress:
        'component_rdx1czlwv54x0v3pp6qyqkwetvc8qqqplm2kspankzqhky0q99xlttg58y',
      poolAddress:
        'pool_rdx1c55annqj4hh3a5k8c3gfqf3g8c3juwawzq45yasuntcvm7ca69t2f9',
      lpResourceAddress:
        'resource_rdx1t5jqlhyagkwn320gjt4gsfktar2lvshfevgz4hqfg5s82rfq7mtru3',
      token_x: Assets.Fungible.MEH,
      token_y: Assets.Fungible.XRD,
    },
    BOB_XRD_3: {
      name: 'bob/xrd',
      componentAddress:
        'component_rdx1cz8m5jhrxpxplz62hqd9ewe22fvdcdskp75te2qklrsl2mwtjfldxe',
      poolAddress:
        'pool_rdx1c5t06jxz28zdjf88xdlj3cvcjg780gtzjk0jqu5c6eenk06geuuvwa',
      lpResourceAddress:
        'resource_rdx1tk4rhrlfd3u8hny37njtaqrzxwwz3rkn9thlkvf7tqfuv26y3zzqsm',
      token_x: Assets.Fungible.BOB,
      token_y: Assets.Fungible.XRD,
    },
    SHRK_XRD: {
      name: 'SHRK/xrd',
      componentAddress:
        'component_rdx1cr9wgrpgdc29tp934xt4p6fq67k6eg98jyr4sdlkvpzr4vghme62kr',
      poolAddress:
        'pool_rdx1chk54hd9xaadd4shmudxx45v9009q7lk90rlk8kuxds90asdrh3qwv',
      lpResourceAddress:
        'resource_rdx1tkacpnv9ee75a3qu4sdyppajnxq9spw34l9y3sxvqvpk9u8y8xqumt',
      token_x: Assets.Fungible.SHRK,
      token_y: Assets.Fungible.XRD,
    },
    EMOON_XRD_2: {
      name: 'emoon/xrd',
      componentAddress:
        'component_rdx1cq5xcl7tam9e0yx4zn2a8jun537zkpx9hnmj8vrhmxswcy0y7a8kjz',
      poolAddress:
        'pool_rdx1c4wn0gyacm7r5g47k0l48lxeue5u84ms0sq9323nufsmeswzq298cy',
      lpResourceAddress:
        'resource_rdx1t5h67cryk0yp73zjm8taz275r3mfl0eul47zvsdslnzmsm8wcj8rm4',
      token_x: Assets.Fungible.EMOON,
      token_y: Assets.Fungible.XRD,
    },
    PHNX_XRD_2: {
      name: 'phnx/xrd',
      componentAddress:
        'component_rdx1cprldxyq52jjulyjjl2ympn4s408a2nrwve9t739x3pucg6kfr0xpn',
      poolAddress:
        'pool_rdx1chhhz8mlwa2wxqtuhjs96zr2vyqgharmhkydjptgdvvxwltwt5wx3f',
      lpResourceAddress:
        'resource_rdx1t50ank4lqt4u28qynv0fe8d5ac26rf0v8ukz294mn4p3mlgaevmtnd',
      token_x: Assets.Fungible.PHNX,
      token_y: Assets.Fungible.XRD,
    },
    HODL_XRD: {
      name: 'HODL/xrd',
      componentAddress:
        'component_rdx1cqc78qge3nnpdzs3gfvvj94z98lcucwthfugkwctpnwfsw0sxclxtx',
      poolAddress:
        'pool_rdx1ckc2m5lurfx9y83r2z0vtz7799g7vck99enxqwfduvym0fpt8pvcml',
      lpResourceAddress:
        'resource_rdx1thv58my4h70pqq2r62w0de2gp5jlrdfv5ug8rf8z878awlh982ld0l',
      token_x: Assets.Fungible.HODL,
      token_y: Assets.Fungible.XRD,
    },
    RON2DLT_XRD: {
      name: 'ron2dlt/xrd',
      componentAddress:
        'component_rdx1cqgmntj4jgu7wg25kkps5dj9vulmywgl4cly5rtf6asxql94ymacyc',
      poolAddress:
        'pool_rdx1c5lea36xu6ats03cpxftplfa0g4r5r50ucglmn4u4nxu506860x6um',
      lpResourceAddress:
        'resource_rdx1thq6jwr3m36058j6l4h4zvnhpcx3ewjjsgtqzcpkg352wu8j8gr0xq',
      token_x: Assets.Fungible.RON2DLT,
      token_y: Assets.Fungible.XRD,
    },
    PUMP_XRD: {
      name: 'pump/xrd',
      componentAddress:
        'component_rdx1cpeu0hfgrr65xzz36y9s9xldmccsx2quadgy6t9cpm9lkf2a3xxlvq',
      poolAddress:
        'pool_rdx1chkxmlaymnlaumsq76zl5kphyx4qsvq52atsqnll7t5s9zphh3kfw8',
      lpResourceAddress:
        'resource_rdx1t5hrxskujaq0g22v327u5atl4cednpsfzzdd7gkx328ju0rmcn9vfn',
      token_x: Assets.Fungible.PUMP,
      token_y: Assets.Fungible.XRD,
    },
    XRD_PEPE: {
      name: 'xrd/pepe',
      componentAddress:
        'component_rdx1czjamk42mupskswgzmgssqvcjtav49awr4sh9ak795mf78r2hdftl9',
      poolAddress:
        'pool_rdx1c5pkpv6hz54vnl6nh5nz2cuwm76ydzl7jst6na4pzcjrqagn62c9uh',
      lpResourceAddress:
        'resource_rdx1t4p44hrn9h43qd36lqn0z9feyjct4u7eaduxr2m3e20sqt7msktgef',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.PEPE,
    },
    VKC_XRD: {
      name: 'VKC/xrd',
      componentAddress:
        'component_rdx1cpage3d07d0vr4u38txekaaq3vueudc4jmus2jfhue3yqnygp4709v',
      poolAddress:
        'pool_rdx1c4hshk8w5eglawjve2z387q9nmuccjr2j85v837utlp4chh2re9ekh',
      lpResourceAddress:
        'resource_rdx1thpc3t2ezpc92zc5jkecsudk0d538y5gkq2t3gu7sh44gz6h8hqww7',
      token_x: Assets.Fungible.VKC,
      token_y: Assets.Fungible.XRD,
    },
    HUG_XRD_3: {
      name: 'hug/xrd',
      componentAddress:
        'component_rdx1cq0j62665ssm939antjpn8ku63fkduu9ywjx2l2fvnqlvuxzquq3jz',
      poolAddress:
        'pool_rdx1c47dzmdpmc7wx3u6vp40qf960w23yxfp50y4er8426juftgjgefjem',
      lpResourceAddress:
        'resource_rdx1th0mdz8zw6rdprgn0p5myql0qepjzq2k682mju2ryn9e729ruhua4a',
      token_x: Assets.Fungible.HUG,
      token_y: Assets.Fungible.XRD,
    },
    WOWO_XRD_3: {
      name: 'WOWO/xrd',
      componentAddress:
        'component_rdx1czyqlz3xxfrej62p5unfjmvucsn470ujaadm54zytanv2mqgvg0qt7',
      poolAddress:
        'pool_rdx1c50vs049a5gt4q5ya4vhecgew8j4z8kxm63pnsjpxe8n73vgfgu7f4',
      lpResourceAddress:
        'resource_rdx1t4gwdwxgaww844k2ycxa4k407j4tvf7du8d9j657jpqlpmut60g58y',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.XRD,
    },
    XRD_LOCK_2: {
      name: 'xrd/lock',
      componentAddress:
        'component_rdx1cr02t7vgmjenh3qmm00yj4fh522aja7ylegffygvx43kccp2gredmr',
      poolAddress:
        'pool_rdx1chqr0nl8g36ju9detzj4gfk73twhxgf4596ekwga2tdl6ks3uqracz',
      lpResourceAddress:
        'resource_rdx1tkqtl5tqsqkef2rh0e44rpx5l2n8hg424dvpdltlcnz8qatpzpfst2',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.LOCK,
    },
    ELON_XRD: {
      name: 'ELON/xrd',
      componentAddress:
        'component_rdx1cphulkeu7f42rw3cvk9jsh4d3yezqvkfc8na6y07neur706lldmmxu',
      poolAddress:
        'pool_rdx1ckx4wcyxfc5gcmudsgsyk9l2fktlnt0wf0yqhfgudapl2v00vhau0l',
      lpResourceAddress:
        'resource_rdx1t4tm9vg0v2vd3slh22nj05dl8p9hsmgvhs5f0e0e4awu7pys69pcdu',
      token_x: Assets.Fungible.ELON,
      token_y: Assets.Fungible.XRD,
    },
    SIMPSONS_XRD: {
      name: 'SIMPSONS/xrd',
      componentAddress:
        'component_rdx1cpydn8djgrc6kl6t9472d2k549p48x28qjn4mrxagtt9qdr6s22mnf',
      poolAddress:
        'pool_rdx1ck8gx9qqx36tklwmknafnw3n24va4xg0aed32qm0vymcupvtujsqnq',
      lpResourceAddress:
        'resource_rdx1t5zwew9ag7dz4kmlhv7hyzn92rg03k8nqpwdh7ke3zrzayrv67zzd2',
      token_x: Assets.Fungible.SIMPSONS,
      token_y: Assets.Fungible.XRD,
    },
    HMM_XRD: {
      name: 'HMM/xrd',
      componentAddress:
        'component_rdx1cq98dgngmqgz23kltmacqnx6xn6gjmx8y4hmt6sx492ajv4hnrx4kw',
      poolAddress:
        'pool_rdx1c57j42gr4erppa06536c9egwttt5r7jwh4hyx3xf8trcmlhu2dmhlt',
      lpResourceAddress:
        'resource_rdx1th7hm6evzd40p078wxx3dm9qj7vt306mjsnkjnnhnnn9vu65ndvxyw',
      token_x: Assets.Fungible.HMM,
      token_y: Assets.Fungible.XRD,
    },
    XRD_PEPE_2: {
      name: 'xrd/PEPE',
      componentAddress:
        'component_rdx1cr2qlwdm7kk57zjjzwr5j5fxl0v76u97jcjsndtcsddurky5g5dgnu',
      poolAddress:
        'pool_rdx1c572h9lmtsrun4y4829trtzmvmmpzjvd88maftkrfw9xj23cswfrt7',
      lpResourceAddress:
        'resource_rdx1th7a78v6mxqv5pnnash0hg0kdv6d4ulspcvcds69508way20rwz2m2',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.PEPE,
    },
    GUNA_XRD: {
      name: 'GUNA/xrd',
      componentAddress:
        'component_rdx1cp2k9l9mj940sgp04392dsyruwuled46qchda3zu9fzh2s2p7fh6su',
      poolAddress:
        'pool_rdx1c4zj7uhq9c5azschrhjj76e63sdxaqj02rvdj9u76t4jj37rtp2luf',
      lpResourceAddress:
        'resource_rdx1tka4r9luhtyu95jlr3wrza4w8nlq4xanh59etkn3kyswxtk8djdddf',
      token_x: Assets.Fungible.GUNA,
      token_y: Assets.Fungible.XRD,
    },
    XRD_RADIT_2: {
      name: 'xrd/radit',
      componentAddress:
        'component_rdx1cpljw06qseznujwhrwzs6llta7gay862r4my27gjk6y4jvf8ndvm7w',
      poolAddress:
        'pool_rdx1c5u0emse6evd97n7yml8ngg7xyvfqplx2unpp6yxar2j8sk459flvx',
      lpResourceAddress:
        'resource_rdx1th9cm4c8548pzvs4r5vvz4hx8dm673jzzc729r5yvsqp5xlyugm8a5',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RADIT,
    },
    XRD_STEEL: {
      name: 'xrd/STEEL',
      componentAddress:
        'component_rdx1crxpaeu6gal98djghcdysvgkv7a35zpwrazmue8pg2u8t534ngdw5a',
      poolAddress:
        'pool_rdx1ch4wmw470zkryam0jsj5xk4ka5twq96lzetcfccsk70fk224h8fqe0',
      lpResourceAddress:
        'resource_rdx1th0e0m9pd4erxz9s08s5n27tyasf6mrn0q584kr4ysudvjc0j4nkc9',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.STEEL,
    },
    XRD_WBTC_2: {
      name: 'xrd/wbtc',
      componentAddress:
        'component_rdx1cr7qs7rq25xavuwxpjapjwrjzdhqm4470nvpj54mcyd5pcxqccu8kx',
      poolAddress:
        'pool_rdx1c593dl3l6mpxtuxj285s4asjtk5s4gfgx6nfrgcn8nsqfxf743c6uv',
      lpResourceAddress:
        'resource_rdx1tks9z5ccnkxx3alvea77x5hn7y4j0pszylrp2zhlfhgw8zjx3qlequ',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.WBTC,
    },
    GNRD_XRD_2: {
      name: 'gnrd/xrd',
      componentAddress:
        'component_rdx1crf2rrjy77rhmyw00fwx3ysk82muahvmcl8yelakflv3d9fnv8042z',
      poolAddress:
        'pool_rdx1c4g5j7yswufxjkm2etjlcr0ku59730tu7xw60uwx64ruk03j2jq6cj',
      lpResourceAddress:
        'resource_rdx1t5lxkk84uvd8udfuwrathn9pvn566m3547sll5u8lr072v8ht3d2gw',
      token_x: Assets.Fungible.GNRD,
      token_y: Assets.Fungible.XRD,
    },
    HMM_XRD_2: {
      name: 'hmm/xrd',
      componentAddress:
        'component_rdx1czvk7032xjjqfh65yg20nw4whfd2q4sh8es2c9yw8hagq0g5w3pvvv',
      poolAddress:
        'pool_rdx1c5us8r9jk94uuu5tv5arxs6u3pe0tyhv24rsqwwpv860xnzz48qz09',
      lpResourceAddress:
        'resource_rdx1thyl78a794sq7d7zp3ln8xz0zhh0lhh8hvfec9gapn3p7s6dhf5qm7',
      token_x: Assets.Fungible.HMM,
      token_y: Assets.Fungible.XRD,
    },
    CATZ_XRD: {
      name: 'CATZ/xrd',
      componentAddress:
        'component_rdx1cquzk2cnyxyk3df54acc5t7d99kt59wcs45plc9lsy730ewenxc2rd',
      poolAddress:
        'pool_rdx1ckqdtzfr60p0wepz89rn3424f6xe4wx0nyd4z44q7fgc28qvnuwm7z',
      lpResourceAddress:
        'resource_rdx1thqn6dqf57rzftgk7ehshmwtndppc9rg6h863dljrpp73h8tjw894t',
      token_x: Assets.Fungible.CATZ,
      token_y: Assets.Fungible.XRD,
    },
    XRD_NOW: {
      name: 'xrd/NOW',
      componentAddress:
        'component_rdx1cqjrwhfq8xtlmngz9f8w2z3xn59zd5r099xvszgthvkzj7gj3usx24',
      poolAddress:
        'pool_rdx1c5vzrppel06hw4hf529x4x2f2n7838gd6hqysmzzhjq9tdpflypu6r',
      lpResourceAddress:
        'resource_rdx1tku7aut6ta8wfkrqlsk73jv080znj7rth78d68mqzawa3s2vczpe28',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.NOW,
    },
    SCORP_XRD: {
      name: 'scorp/xrd',
      componentAddress:
        'component_rdx1cqqg7a883zy0gre4ncw9wq92r7ye6yuh4ekgsht6aqqyv2xf8cskfr',
      poolAddress:
        'pool_rdx1c5p6zv66q0ahx9exrz0lx60xmwmszygvwy5eyz2n94yvjhrdez5ulr',
      lpResourceAddress:
        'resource_rdx1tk8wp4m74dtp6sxu4w2n360hcwka6n8z0yuhhcw4uskf097k63juvv',
      token_x: Assets.Fungible.SCORP,
      token_y: Assets.Fungible.XRD,
    },
    PZZA_XRD: {
      name: 'PZZA/xrd',
      componentAddress:
        'component_rdx1cq6kzu55h89gn84jcagv5v0w824fwuntve9ffdd55th8pu7gydq7ql',
      poolAddress:
        'pool_rdx1c5tu6z0kxz3hlg4ynut48ttwugnz3wpq3qknsp7vg024f956aj83we',
      lpResourceAddress:
        'resource_rdx1tknq5xgquqd677dlvwp7s8e07nxqwafwxkc40k4ls0jfvy8e4cu99g',
      token_x: Assets.Fungible.PZZA,
      token_y: Assets.Fungible.XRD,
    },
    SHINE_XRD: {
      name: 'SHINE/xrd',
      componentAddress:
        'component_rdx1cz274he0dl5f3vjvf0vcq2fxmmaq3tusxxat2s7elj2ajr6tsp436q',
      poolAddress:
        'pool_rdx1c4skudf2v4nfa529fktaguv5mwn24wjtlk2waxlcydgm0u4hr8jjqv',
      lpResourceAddress:
        'resource_rdx1t55jz4ajreldh0hvfxnr54lp6aa4j2f9ysrn7c9035nnwxll2h5cg9',
      token_x: Assets.Fungible.SHINE,
      token_y: Assets.Fungible.XRD,
    },
    XRD_RGPF: {
      name: 'xrd/RGPF',
      componentAddress:
        'component_rdx1cqhwjcrdz79e9tz2ktm72m0sjznjuyx3r9enx7vd89snku8g7e5za0',
      poolAddress:
        'pool_rdx1c545unngp5rdlwy9dmc6kgjy355q7xr68d3gqp9vz3qsr4wax3gca9',
      lpResourceAddress:
        'resource_rdx1tha7t5tp05wgdtr98xt0met8hh47c0g7z09j3xsw8hmsru57ugy070',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RGPF,
    },
    XRD_TENGE: {
      name: 'xrd/tenge',
      componentAddress:
        'component_rdx1czql2j4j7fxhlu4ke4v2khdztxfqzurwzjagy0ksz784ljexmx9zq5',
      poolAddress:
        'pool_rdx1c42qtc2hzrv0v2eckq6gcmtreqp62n5vugt7wqc8a3lcq73d5yc6fu',
      lpResourceAddress:
        'resource_rdx1tkjznkwtqzdlf4ueawx8f6et2j0tkgd2qzsflspfam303z4u336fj2',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.TENGE,
    },
    FLIPP_XRD: {
      name: 'flipp/xrd',
      componentAddress:
        'component_rdx1cpskv6xf0yvpz9umavevx8v6rqeanqvhyfun2s5gsrd4jl0ua2a0uy',
      poolAddress:
        'pool_rdx1c4qxu40dkxkd65jnna2dd83mtavplf5pc06zcv5twua3lajygr8g5h',
      lpResourceAddress:
        'resource_rdx1t4vd4fdcuqjqaxz7z7tmaswupyrq808wl7q6k293vh5v6z4h6g5mjc',
      token_x: Assets.Fungible.FLIPP,
      token_y: Assets.Fungible.XRD,
    },
    SINX_XRD_3: {
      name: 'sinx/xrd',
      componentAddress:
        'component_rdx1czky3unendmgzwv3jttly78uhy39tlfwh5mwdv79flxx92tdvqtw7q',
      poolAddress:
        'pool_rdx1c5x3yh2vshayaxhmm27fycr2sxvuwjhy34rl42q5h70rl8ekkdulpq',
      lpResourceAddress:
        'resource_rdx1t579tgfs9krszs0tq9ka0lcmhf2v2h6xk4t8qpdqfe3qmyyv0q9v5k',
      token_x: Assets.Fungible.SINX,
      token_y: Assets.Fungible.XRD,
    },
    RST_XRD: {
      name: 'rst/xrd',
      componentAddress:
        'component_rdx1cp2yxx63fwjeg6zchmug9wzswjkj8v30c4wu9a5khvre9vwulcvug7',
      poolAddress:
        'pool_rdx1c5p7a3y6tvt3tp9dz27g6uqkz3766m6jny8nvnr7l9a6law9sqr34r',
      lpResourceAddress:
        'resource_rdx1t5p4f4vaqkjzz9ftwq8xtfkmxn7ekpxqrraa3a7qzgpyeyslvypspd',
      token_x: Assets.Fungible.RST,
      token_y: Assets.Fungible.XRD,
    },
    WOWO_XRD_4: {
      name: 'WOWO/xrd',
      componentAddress:
        'component_rdx1cp2s04ker5ttzu94lkj4524fue24eyjy5pchxqsayjpn9x75vme7ym',
      poolAddress:
        'pool_rdx1ckagjx98zws20mh7heckydvxpj4upht9rqt0kvf0cul428ht0xyr30',
      lpResourceAddress:
        'resource_rdx1tkw8fdeewf769e8vh0ha7mca0ry9qhwc8s7phnlw9r6n0a8cu2hxfq',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.XRD,
    },
    FUD_XRD: {
      name: 'FUD/xrd',
      componentAddress:
        'component_rdx1crpuwsc7ypqtrkm3cy9kg2f53j26cl47vqmqczu0nh7t0ps2f7pq82',
      poolAddress:
        'pool_rdx1c5jke9pxcusww890ruqlx9va2frxu0d5xmewn783m62jx22h9p6ytq',
      lpResourceAddress:
        'resource_rdx1t578ah78rw9vn9gvta520nxjh3s2l4670stcrq0culxpy6235lwzy5',
      token_x: Assets.Fungible.FUD,
      token_y: Assets.Fungible.XRD,
    },
    WOWO_XRD_5: {
      name: 'wowo/xrd',
      componentAddress:
        'component_rdx1cz5jtknztc26heh2w0kmrx25h0k7zlhrthrnxum5yq6jvlgal46n2g',
      poolAddress:
        'pool_rdx1c4tnkmdlfrpvknyf9dz7u9qz4f8escdpqc8mulvsyn03fxsulndg0k',
      lpResourceAddress:
        'resource_rdx1t4sstu5zgxs04klfgfkwg88acw28zt0p5feag30kz73k0m888y4z09',
      token_x: Assets.Fungible.WOWO,
      token_y: Assets.Fungible.XRD,
    },
    TWERK_XRD: {
      name: 'TWERK/xrd',
      componentAddress:
        'component_rdx1cqf7669c3tcfeneey4dalylqwf88t6xdxx0huqaewl2v2cnsnmc0wu',
      poolAddress:
        'pool_rdx1c5fatpqrukwv0astpxxr6sdu40tg7v0p73pdnjk5tkckwjwprq38pe',
      lpResourceAddress:
        'resource_rdx1th54ayjwwrz9l87y5rw2056x49v6nwn0xjz83earyp93njth94g7tq',
      token_x: Assets.Fungible.TWERK,
      token_y: Assets.Fungible.XRD,
    },
    LOL_XRD: {
      name: 'LOL/xrd',
      componentAddress:
        'component_rdx1cz85exeuhqku6as78xtdc4zgk4vd3fs0jlctkdtle8ruex2yetuzlf',
      poolAddress:
        'pool_rdx1c4c5jqkzzfxfq8qy0ky3lhzzs5f7u45pr7k06q8w3rk03gt047kv4s',
      lpResourceAddress:
        'resource_rdx1t5xdnfa0jq9sq28u3n3q5c8x8249gnqexsqa647md8vzpwahusc3dw',
      token_x: Assets.Fungible.LOL,
      token_y: Assets.Fungible.XRD,
    },
    XRD_HRB: {
      name: 'xrd/HRB',
      componentAddress:
        'component_rdx1cqp0cppp08kmmpwcw4gugvkc9wys62gu59u7v8klh3jtlraqq8fv4r',
      poolAddress:
        'pool_rdx1c4pqwsl3hxa3al8kgyh2p6sqdg6v0u33qxjvtj9jqhmvf86klefru7',
      lpResourceAddress:
        'resource_rdx1tka63z3m863cxw6avju530em8f5zncs5atx2njk3p2ppj4c6a6m7vw',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.HRB,
    },
  },
  flexPools: {
    ILIS_XRD: {
      name: 'ILIS/XRD',
      componentAddress:
        'component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd',
      poolAddress:
        'pool_rdx1c5cyh7lhxly2mxzsmrs4c99vhxt9jzap3gaf7s8h0h68fqlpfht0un',
      lpResourceAddress:
        'resource_rdx1t4qxj7nnm0sra6f6j9jq73erd489hdad6jp92hggtfwgwy9p2mgn76',
      token_x: Assets.Fungible.ILIS,
      token_y: Assets.Fungible.XRD,
    },
    /*XRD_CVX: {
      name: 'xrd/CVX',
      componentAddress:
        'component_rdx1crzyyrrlu3t6yftk4z2v7uf3g54fh0y98z08zvk6sgwlxkkzl6avmc',
      lpResourceAddress:
        'resource_rdx1t58mhcmr0clqlm824sh5v6tad3gz7qzge5q2sxnuuvv23ghp52wkrc',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CVX,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    RWT_XRD: {
      name: 'RWT/xrd',
      componentAddress:
        'component_rdx1crtntm85kkjfvv2pewdqhpgjx3dz95rdwv4hq4aju7ta4evg5kl552',
      lpResourceAddress:
        'resource_rdx1t56fdgfz9dg0txduw6lmer6lw9dk83ju8tyh4xsy9df3fgfkexh7v8',
      token_x: Assets.Fungible.RWT,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_LOCK: {
      name: 'xrd/LOCK',
      componentAddress:
        'component_rdx1cpyeyjsyfc0lkh4fhp0tjzdh2wsuqyfywt6x9gc42ru4q4pcevldpr',
      lpResourceAddress:
        'resource_rdx1thsn5zcfzmq2hxvg6zh82vtdmygp7x3ugu754waedflr6mgyanfsxt',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.LOCK,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    RBX_XRD: {
      name: 'RBX/xrd',
      componentAddress:
        'component_rdx1cpcwm3w254rjc74xpqjcla08tjd6ms3eyzc5yfmhuwuha6vas0dr2c',
      lpResourceAddress:
        'resource_rdx1tkek0et6dhd3qujzatcyr9nd448vx8xmlp49q2sm8cyn2suurv2zda',
      token_x: Assets.Fungible.RBX,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_PPCAT: {
      name: 'xrd/Ppcat',
      componentAddress:
        'component_rdx1cpmpak0j5eztusar6m0nz9qq3c6t9srx70efpf299vfctc05uw4xle',
      lpResourceAddress:
        'resource_rdx1tkcl4npnmdw8ctsvld7ng97hp2tj260pt2n0zzmudd3az9q4uf3j6k',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.PPCAT,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    HIT_XRD_2: {
      name: 'hit/xrd',
      componentAddress:
        'component_rdx1cqqdgk82ltxgmkn5t7lvjfcnvh20w2dqvyumcwpvhhluhaykky837v',
      lpResourceAddress:
        'resource_rdx1t5t40xp6j9xyy2n2qlyxedt4rh59drygr90a7msqpsz78f5gtag4px',
      token_x: Assets.Fungible.HIT,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_RR_2: {
      name: 'xrd/rr',
      componentAddress:
        'component_rdx1czfrlevyke7q99gxxpe23466hx6atz5p7gscgsn02x5dln9mu93xl5',
      lpResourceAddress:
        'resource_rdx1tkjyra7074d25x373gmr4q7sphzs502p8hkxmahjx3tw086940fpj4',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RR,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    ZOOMIES_XRD: {
      name: 'ZOOMIES/xrd',
      componentAddress:
        'component_rdx1crjwxv7zv6ux8s4xlrtl0v9fqfxdn63sxqpc4fxnntj2kfckdalvad',
      lpResourceAddress:
        'resource_rdx1t4m9a09r8z0gteqmkhpqm0qdvm80w6hkp67ey80t4ah692yzmsmq5k',
      token_x: Assets.Fungible.ZOOMIES,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    ERM_XRD: {
      name: 'ERM/xrd',
      componentAddress:
        'component_rdx1czgrwztnxlcpxyq6f8ewht9zy59e0yx62453emrslrez7afpktzhw5',
      lpResourceAddress:
        'resource_rdx1t4pmuw6qjf9yalxnggfja6nth8a43f9w602v5c7ckux2ap6fm8za8p',
      token_x: Assets.Fungible.ERM,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    EMOON_XRD: {
      name: 'EMOON/xrd',
      componentAddress:
        'component_rdx1cpm3km9nyu502qvhswsaxmsykphw4qdxjm4vdd6gud2g79qya6wg9y',
      lpResourceAddress:
        'resource_rdx1tkwnsxxqa6zd3yfxmnhr7hrvdvfmzscr2mtdxf5gxg63u3m5presax',
      token_x: Assets.Fungible.EMOON,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    CTO_XRD: {
      name: 'CTO/xrd',
      componentAddress:
        'component_rdx1cpm6f2g78lprh9gqyfzshwassmcvegplkl69wvpaaeamg9vj4833qs',
      lpResourceAddress:
        'resource_rdx1t470dqzmyzr46nfvfpa9l9v746al7z95fen89re58zdgqvetstt22y',
      token_x: Assets.Fungible.CTO,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_RR_3: {
      name: 'xrd/rr',
      componentAddress:
        'component_rdx1cqgqhe2gq6vg66dn2kmnhuj0xnl7ckpp5l7q2s93rqn4g82kpl8enj',
      lpResourceAddress:
        'resource_rdx1th06almjf3q6ndfq2ms472rjx3nlglua5l6w7j4n52q6s4zcqmcm90',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.RR,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    ERM_XRD_2: {
      name: 'erm/xrd',
      componentAddress:
        'component_rdx1czgqfkaay4df5cdg4f88gxf5alwu48k84nph3snmjcv9vaalhcge5c',
      lpResourceAddress:
        'resource_rdx1t4q2kwj6upphxaqn5fk49v5mqmu230uuej8aptdqflp4y4j8knfw9p',
      token_x: Assets.Fungible.ERM,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    DEVIL_XRD: {
      name: 'DEVIL/xrd',
      componentAddress:
        'component_rdx1cqwk5hxwhtxtvmulzmeg9h9xmxprkytkgtws8dlqpqpdxk5p3x40ta',
      lpResourceAddress:
        'resource_rdx1tkvv490qrymu9twtk27g5s96pjx0utylssrhjvhjxhd459q5x9q70d',
      token_x: Assets.Fungible.DEVIL,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_CASSIE_2: {
      name: 'xrd/cassie',
      componentAddress:
        'component_rdx1cr4tf35mxxtg7ukg89hg2em8vrpp6vgxkrxplkarsc3qy8vqehjs9r',
      lpResourceAddress:
        'resource_rdx1tkjks4akwmgswjt3jt9lxmgsszlmklcjflzlltc5xegaxe6cuxuwl7',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CASSIE,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    CXRD_XRD: {
      name: 'CXRD/xrd',
      componentAddress:
        'component_rdx1crds3duujagnqjy03dt732hfs43gtl8n0aruxmy6h64ppgcxm7k9j3',
      lpResourceAddress:
        'resource_rdx1t5zkcku8az8nm94e6uqlduah6hf370yr3rh6af8q6kpxpxd4vs2xw2',
      token_x: Assets.Fungible.CXRD,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_NEARLY: {
      name: 'xrd/NEARLY',
      componentAddress:
        'component_rdx1cqlvd4vpg4klp8n9dx06mvanhth73uusu8ftm7xvqvuegqf556dn8s',
      lpResourceAddress:
        'resource_rdx1t5l3p6c7hqg7uevr3daejtnrxzev4zrh8289x6xpla3sg9nmrsgfd2',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.NEARLY,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    FLOOP_XRD_2: {
      name: 'floop/xrd',
      componentAddress:
        'component_rdx1cphnelsmy9p9qewtavgskgu6n93wh432a03yux2yfp7gdcc9xhhhtf',
      lpResourceAddress:
        'resource_rdx1t5u93r2pgczusyxp8ddryewt2pdvkl4w9r80wu72wuxmvs8n7sy0x2',
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    TRUMP_XRD: {
      name: 'TRUMP/xrd',
      componentAddress:
        'component_rdx1cqy6hxy5q20m3qq748gu4udsn8zfth4lpzgpmpvlvk0psc5nu8vwmt',
      lpResourceAddress:
        'resource_rdx1thshmermeldfj73wy3v767706n698eecxqy48gd4fxk68pxxgqarfc',
      token_x: Assets.Fungible.TRUMP,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_DONT: {
      name: 'xrd/DONT',
      componentAddress:
        'component_rdx1cqz7fuxx0jamykqhs7ldrc86g4etkketw3e5n5vq95hyk4cjvvdm7r',
      lpResourceAddress:
        'resource_rdx1tkf3ju58plqefaxtdcyx2ta36k7gf8xxpte2u5zfxxv67mat42srcs',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.DONT,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    SLACK_XRD: {
      name: 'SLACK/xrd',
      componentAddress:
        'component_rdx1cqcydm2hda6tt4s5wmxy27unfdr59ttvgw4xd6k75420vc8t759z6a',
      lpResourceAddress:
        'resource_rdx1tk3szen6htl8s99jpjgkv22tmk24wad8u5rjacmllc26ufndc9gdld',
      token_x: Assets.Fungible.SLACK,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    ASTRL_XRD_2: {
      name: 'astrl/xrd',
      componentAddress:
        'component_rdx1czrks23pt35cmapgt9amv6haxagpzds5pdqp6jxt97dm2azrtxvdch',
      lpResourceAddress:
        'resource_rdx1tk3lcmazstm3p0vl0mc8d3ah2n8krkl4jh2fd8j2laf43jypmmm23r',
      token_x: Assets.Fungible.ASTRL,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_CHUG_2: {
      name: 'xrd/chug',
      componentAddress:
        'component_rdx1cq6pzxu70nd37s58qketukfnx2j9w29pljqvu5h5n32l3lzyrwjdkn',
      lpResourceAddress:
        'resource_rdx1t54hs4wpss2nh5vsjn5vghtzt2u5neqlxelcjvll5y9aqhwes44jmp',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CHUG,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    CHILL_XRD: {
      name: 'CHILL/xrd',
      componentAddress:
        'component_rdx1crn9kh496e5mpmsdzn6dw955tcdjqz5752s5rzxeh4negyceqrlw35',
      lpResourceAddress:
        'resource_rdx1t4f7dz4gh0n8sa4k7trvl39ng5qpw9vrqnppvl0kjfjgupvh83qf4w',
      token_x: Assets.Fungible.CHILL,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_BRO: {
      name: 'xrd/bro',
      componentAddress:
        'component_rdx1crmr70clv0s6s2wjd0y735cahqhhn3y3j3uuxrtj3vprrv09uydxe9',
      lpResourceAddress:
        'resource_rdx1t5jcrugpvdh6gewt9tjngtuaxqke8wpq27trl4ymv5w4pa39n79mjw',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.BRO,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_MGC: {
      name: 'xrd/MGC',
      componentAddress:
        'component_rdx1cqdzj3wtjr9p30nygcynp7exutnstyelmjcpl4h96xw9l900jdsqz8',
      lpResourceAddress:
        'resource_rdx1t4jcxgynlv2rzz6am3rl6ctdfk9pmsvd3etsjd6e2l8en5et5fdvnl',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.MGC,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    RZR_XRD: {
      name: 'rzr/xrd',
      componentAddress:
        'component_rdx1crsmvhw7axt0sps6qe380uh308kea549xajr9rhgejkdegrsy09ene',
      lpResourceAddress:
        'resource_rdx1thf9rquxcc7f24trkkh7cmwstkqwn24slpy57gztel9hczpcg3wsfa',
      token_x: Assets.Fungible.RZR,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    XRD_CAVIAR_2: {
      name: 'xrd/caviar',
      componentAddress:
        'component_rdx1crac6eyc64slf3f0l6pc8kn8quuntw643cl679fg2wsr85vafc70yq',
      lpResourceAddress:
        'resource_rdx1t5vgq7xa7v26ld8k6trrwfdcmu3xe8mqdh8hdlyr87304l2ln7pqpt',
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.CAVIAR,
      divisibility_x: 18,
      divisibility_y: 18,
    },*/
  },
} as const;

export type OciswapPool =
  (typeof OciswapConstants.pools)[keyof typeof OciswapConstants.pools];

export type OciswapPoolV2 =
  (typeof OciswapConstants.poolsV2)[keyof typeof OciswapConstants.poolsV2];

export type AllOciswapPools = OciswapPool | OciswapPoolV2;

export const ociswapComponentSet = new Map<string, OciswapPool>(
  Object.values(OciswapConstants.pools).map((pool) => [
    pool.componentAddress,
    pool,
  ]),
);

export const ociswapV2ComponentSet = new Map<string, OciswapPoolV2>(
  Object.values(OciswapConstants.poolsV2).map((pool) => [
    pool.componentAddress,
    pool,
  ]),
);
