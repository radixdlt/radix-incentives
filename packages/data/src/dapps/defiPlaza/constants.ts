import { Assets } from '../../assets';

export const DefiPlazaConstants = {
  xUSDCPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c5z06xda4gjykyhupj4fjszdfhsye7h3mcsgwe5cvuz2vemwn7yjax',
    baseLpResourceAddress:
      'resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x',
    quotePoolAddress:
      'pool_rdx1ch62axcl22gnmhe5ajtwraukrxstxxqlq5c6p9n2y5qv0pgyqnhfry',
    quoteLpResourceAddress:
      'resource_rdx1t5gr3wsf7jq28fvnpyfg4rwfkewynv67nnqjna9h5f7mwjuwcwegcj',
    baseResourceAddress: Assets.Fungible.xUSDC,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      'component_rdx1czmha58h7vw0e4qpxz8ga68cq6h5fjm27w2z43r0n6k9x65nvrjp4g',
  },
  xUSDTPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c5pvssdmlgjh78anllzszh7alal666ayv8h6at3xmxmmpueqf7at4q',
    baseLpResourceAddress:
      'resource_rdx1thnmcry6e02x6ja73llm8z6pkrurvrsudgez4ammsp24r0v20rllxt',
    quotePoolAddress:
      'pool_rdx1c4scl7k67czs4e29skz0njvcmx4epmrjk4nkrkvsmt93rug7jcnagf',
    quoteLpResourceAddress:
      'resource_rdx1t5swt0y0u6sdzycg02flamm3e6qljjgvpxeg5p5tw6jl7ssel0x369',
    baseResourceAddress: Assets.Fungible.xUSDT,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      'component_rdx1crhrzxe6x35hwx3wmnnw0g8qs84p2hle6ud7n2q4ffzp0udluqm8hj',
  },
  xETHPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1ckt7dhmt5gr9vdsgz3p62fm88pm7f69kzzqw2268f3negvgns2xkpa',
    baseLpResourceAddress:
      'resource_rdx1t5k00sp4jejklp8cx6nw7ecvhz7z07mfexgmdyflgqpflfvzv8v7wd',
    quotePoolAddress:
      'pool_rdx1c5glrayedmn0utd44pqs8a3x52dw9aklq2g5f9ewxjxtm7xvjmussa',
    quoteLpResourceAddress:
      'resource_rdx1thhth6tseavhurrgae898k9sht29f3yckzr6szct6zgheqdhxkus0t',
    baseResourceAddress: Assets.Fungible.xETH,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      'component_rdx1cr0nw5ppvryyqcv6thkslcltkw5cm3c2lvm2yr8jhh9rqe76stmars',
  },
  xwBTCPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c5xlqz5uc62fzlsyl2f3ql6lx8upc75tdpe4f8cmys83lpqrrul976',
    baseLpResourceAddress:
      'resource_rdx1t4x7f34hec2jxtay6cvxvcq3skmkg9pwtr98m4dm7qfrvnaddlavgv',
    quotePoolAddress:
      'pool_rdx1cht7hqhcnj2la96cygema5l32xwz26luunr9umlszy3s9gr78ppdzv',
    quoteLpResourceAddress:
      'resource_rdx1th6ftl6twglqfz2s8ref2vr5nfccaeq2878p4996uq5duszkjhp2gl',
    baseResourceAddress: Assets.Fungible.wxBTC,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      'component_rdx1czzqr5m40x3sklwntcmx8uw3ld5nj7marq66nm6erp3prw7rv8zu29',
  },
  ASTRLPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c47jlmd9stptfy2a7e39wnjfechu72q9ggus29x0mqf98m8xt70rx2',
    baseLpResourceAddress:
      'resource_rdx1t5q26nr5t02pzf40tp9z999ex7d84szldnpqg8e459jyvztrxhqqls',
    quotePoolAddress:
      'pool_rdx1c4xm5wfm92vh39dzszzv3huvdmvz73juhkw8vls0z4fg2vfr0wkv93',
    quoteLpResourceAddress:
      'resource_rdx1tkuuhphx2rtdytucgt0ucnd4k8zymxdeta4xa2req93yuaup3s244u',
    baseResourceAddress: Assets.Fungible.ASTRL,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1cqvxkaazmpnvg3f9ufc5n2msv6x7ztjdusdm06lhtf5n7wr8guggg5', //make sure this is PlazaPair component, not Dex
  },
  XRDPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1chxn0nqj840r78t2ah5agchq4ue9p65q23nc9ckqfe0mmjstq8fyg0',
    baseLpResourceAddress:
      'resource_rdx1tknxlx2sy23qkg6twvnu3kqcd5l4daacq0n6mdam54upqgx50f4ju8',
    quotePoolAddress:
      'pool_rdx1c4547fnprjhlp2m27aycmf8rzrkrfzcck58jt2706r85gpcaeapz7k',
    quoteLpResourceAddress:
      'resource_rdx1t4a5clnxmnctmezaty08cuugfzmj2lezqcjk2szezrfdfl4w4ederu',
    baseResourceAddress: Assets.Fungible.XRD,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1cppd8rq7gfwad75z56mz9tldqmw4aps48hqnx2stf4eeew8v6tyd72',
  },
  REDDICKSPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c4ezdn72f3zk6hudfcsappvs6wypqyvdewuguv4jzrxdwf9www336l',
    baseLpResourceAddress:
      'resource_rdx1tkcczq5ahrk3ysllftmmy3h9ghejqcwm53ywwymkdlcv0fc3tsy4en',
    quotePoolAddress:
      'pool_rdx1c4nzrhejsq9k6udxzgwmn2rdrrcxd97r9354fs5yn3ewswxztqyvk3',
    quoteLpResourceAddress:
      'resource_rdx1t4dwv040r9fzx7gk7n088920guwlg6ln5m768gnxwlrzdcyrhrdxw5',
    baseResourceAddress: Assets.Fungible.REDDICKS,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1cq0m4e6gjyekk87lxugtgw6a5cnm7fa60vqn6rpe02hjhfh7tus2x6',
  },
  EARLYPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c4n9xxzxqxupdlgesyj075lnt88e8dzcykxcx7l0wz2q5kdw53cq8f',
    baseLpResourceAddress:
      'resource_rdx1t5908ql2dhz0m33dfljq8803z99jmeqrej98tjf9g6shadj7tvgjle',
    quotePoolAddress:
      'pool_rdx1c5cvl8qy0rmkhk9twe2ra2qgr87a7zx2hkk77utyczyym735rw96fu',
    quoteLpResourceAddress:
      'resource_rdx1tkc7hdmwhgza24nes4z0yf2ljc2fedvg2h7el2fzdxfgw0f2wq7pwz',
    baseResourceAddress: Assets.Fungible.EARLY,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1cpr3gvk0r3nauc24kt0y0w5cpvjcxe54z07nu26z83qk2tgeangmdl',
  },
  ILISPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c4c277rrwq7qr348pf3ggy3ja8j5v7ykxec65c267dcq00w3egn9dk',
    baseLpResourceAddress:
      'resource_rdx1t4z3dn6u57kj069wru4tkmdrx8njz2d9a5rlfsphs87cyuaj9tufv0',
    quotePoolAddress:
      'pool_rdx1c5rn7cgkagdpsumpss2syk22lhf4w2kzn7dghdplewrlzk8raf754n',
    quoteLpResourceAddress:
      'resource_rdx1t4tkxcr6zmk2var44h60x04hf973anuulha30346m7nfh25hyulzle',
    baseResourceAddress: Assets.Fungible.ILIS,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1cz9akawaf6d2qefds33c5py9w3fjpgp2qnaddtlcxm06m060wl2j68',
  },
  FLOOPPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c5zmgeruwyv3qyyzt5cz9rty58zgf40vm5lage3vluktp07633vaww',
    baseLpResourceAddress:
      'resource_rdx1tkmvuls8ktxwt7trrs5cvjeu8rk5036l6kr07s84gr0jzqmwk4qmdh',
    quotePoolAddress:
      'pool_rdx1c4857kjzh4l4gz63yptcjnm4pjpkxmxdw20x2cse3g0qk0kgr5cngu',
    quoteLpResourceAddress:
      'resource_rdx1th75g4s4rrltrdlp6mlerpkgsc6tgsnwh06f2pacxhgvf7laflrva8',
    baseResourceAddress: Assets.Fungible.FLOOP,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1crvsxzkyh0609z4jj7vjzwrnede37676al287rumvy5p32wpvtr59e',
  },
  WEFTPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1c56ws8tmvw2ggk8hpfq4uvn9vthhv4g2cqs4htj3tc6r9w835te3fs',
    baseLpResourceAddress:
      'resource_rdx1thus6t5yn4msedhslmyclqdduunrat85w6q6tmnep7h0vg3hcsmawk',
    quotePoolAddress:
      'pool_rdx1c4tzllfgu66axcr9q4uk36frpyfuuw97wlp298xvll6x38ac092mwp',
    quoteLpResourceAddress:
      'resource_rdx1tku2gw3j3hpp5f4dak5pxct2lhw8jpqvvv762r4d3ffu2enpllg2j9',
    baseResourceAddress: Assets.Fungible.WEFT,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1cq77k5vwv90fp6fllkp650zhs92vvy6pvcdvm3cwvnha2zz62rg7l9',
  },
  OCIPool: {
    type: 'component',
    basePoolAddress:
      'pool_rdx1ckhtf3z2889zmh57vz9g8wrgs6yl8t252t78zqfz54qd68erj7y0dm',
    baseLpResourceAddress:
      'resource_rdx1thj6rq8ceh6n4zvwswwh8f0xmuzs263eyg7t35uupujh88xa66v5wh',
    quotePoolAddress:
      'pool_rdx1c4nltklts49fkzvdhhlflu3z3vghskhjkedm4xq0y0pfqry20jw4rv',
    quoteLpResourceAddress:
      'resource_rdx1tkc89zy5fgtmmx672ec23rnln6zzfzy6yyswtg4256atspmutq77wu',
    baseResourceAddress: Assets.Fungible.OCI,
    quoteResourceAddress: Assets.Fungible.DFP2,
    componentAddress:
      'component_rdx1czmc0yzur2tefmx9mjdxdudc49vv7h2zh5xcg3sy47ja3v3d7wppsh',
  },
  hethPool: {
    type: 'component',
    baseResourceAddress:
      'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
    basePoolAddress:
      'pool_rdx1ckfa8h47ghy8enmz29k6cxgl5x87qy3gkzetsw82fpuvrdzc6563q2',
    baseLpResourceAddress:
      'resource_rdx1tha0rthe4jgmwuz0074eazu3n8w2v8m5mpx453vq5ux7dqnaxz0y0g',
    quoteResourceAddress:
      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
    quotePoolAddress:
      'pool_rdx1chawt3wgkpe0jkdhgrysw9dducx3032nse8r9tfl4gsxfqp2z2alx5',
    quoteLpResourceAddress:
      'resource_rdx1t4xldwkew79skplfk3lempg459xhlhzj5xy5r86jfjrud29lpalytd',
    componentAddress:
      'component_rdx1cq8nefdv75yqkgwqe9rhj436yr3z09du7g797y90prmwf9ugv0m8u2',
  },
  husdcPool: {
    type: 'component',
    baseResourceAddress:
      'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
    basePoolAddress:
      'pool_rdx1chxzajmur7p67h0uvk7etgnm9m67ptzfv7ysfdvq35ck2zz6zuttqq',
    baseLpResourceAddress:
      'resource_rdx1t5qsyevr7ry54uxeh9s7nm6wjdan0c8ks63c2dmpdxsdumum2vsl82',
    quoteResourceAddress:
      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
    quotePoolAddress:
      'pool_rdx1c5t2v0jac6sdyv9qs5hur76uc5kjr70sl8dftc5aa92k0tsuc06r04',
    quoteLpResourceAddress:
      'resource_rdx1tkjvn5zek8aj34rmzd9vd5qtr35x4ytlud857cgnq066lzkc0mygzw',
    componentAddress:
      'component_rdx1cqs6t5t70fcgrva6ws6gs84u29w3kecn6j0zkjg0u0x9szx0xnusxj',
  },
  hwbtcPool: {
    type: 'component',
    baseResourceAddress:
      'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
    basePoolAddress:
      'pool_rdx1c5xdcsxjfpled776cl2ln2mdv9svh5sp4z8u3qhv5r5sslnuxul7rs',
    baseLpResourceAddress:
      'resource_rdx1tkaems6ywyrqrs7vk0fjk87s8sa2n0wcc4zzkyms04nu6mv739xpyd',
    quoteResourceAddress:
      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
    quotePoolAddress:
      'pool_rdx1ckv54hdmtyn308zkm3mq98876puwhpqa3hrn8d27swgspaackvnmu7',
    quoteLpResourceAddress:
      'resource_rdx1t575tme0szzjp78ms6m2h6suale84d9ululvwhfkm0jdw2y9n50c2f',
    componentAddress:
      'component_rdx1cqy8gd5wk8cq7c4g4gpa2lgulk7tcqj673fgz90cu7fa6x2f9gshaz',
  },
  husdtPool: {
    type: 'component',
    baseResourceAddress:
      'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
    basePoolAddress:
      'pool_rdx1ch5zj8tlarxz38kwh4ss3jn5mphd98rssalkmfut6mhzvswezzg3vd',
    baseLpResourceAddress:
      'resource_rdx1t46hgy2ut87zeu8jfv6k24d8l4s7mjwjdqsd2qnvu644gyc4l7g0xn',
    quoteResourceAddress:
      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
    quotePoolAddress:
      'pool_rdx1ckvu5wqp2pc284yj7jssckueqtcvt72gjjwz4sv4rl5kdtk70etg2n',
    quoteLpResourceAddress:
      'resource_rdx1t45t2dpdgydlrtpxejwm04uvn2dc8p7nmch8ffcd0vf25axd0aptdk',
    componentAddress:
      'component_rdx1crz9nv7mvp3lamx3kl4xq8lgwyalvn7rgmlzse2rfs4r9u5sdq0vzh',
    fotondfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.FOTON,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crhqaavz9m77dcy5p08agya4n6wsrtenlka3ex2c8wka7yqy32j8kl',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    dgcdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DGC,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crpr0s3l0m8mn269awnxxy4dw29lvcj3ckrkeqdlhhzw55y30njzn7',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    dguldendfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DGULDEN,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqy4pz9xzqcsgtyuqk2pslurzuyqghnypkswxqqehjcstn4t0xms2k',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    dphdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DPH,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp2jlkev5mvkr2grlyeyhghwxkanjs5j9ahntak6ah3x4dz27st7vv',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    gabdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.GAB,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr7th4wfx9er7slc0dy89upasea0uuue52vdlgrgrj08zsf6ynwmea',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rdkdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RDK,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cquymnngsl7zsasxsxxpyvpshypkmq745fchesp0nh0h8k5d684aaq',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    planetdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PLANET,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czvzlzru20lr8030s0ze393p254ls3quj576vqsyzxdkn0arxqctct',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    smkdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SMK,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crrfjm78v562lp850e0gq95jqku67kd9dev4ylv7ultgzc48lvlz56',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    raditdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RADIT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr9pks5m3lga42gkwh3kgn09tyvlnrcsjahpsy2pnkvekjxrhvfs0n',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    caviardfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CAVIAR,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr8grgdyykyg2e979h23w4vdj3qykhyuj5kcx0hsrvvqgnm9muq77j',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rdsdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RDS,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czs38cg03wmxr7pw5sr5y26ypcc2vv2vt7ttk34ykeecjv0h92kudt',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    cmondfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CMON,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cru0xyw87tj5l70txaa8dajl89pf8gm7rajmj8auac8h7cdtt2y9r9',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    luckdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.LUCK,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czae9r88segk7d0qp24st9clhgjxuxlftllt60swfngndqkvjlp8aa',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    hugdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.HUG,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cz5fuzruncczpsz6kksz7zjvg3u4a94ll97ua868357vhzme490ymt',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    mnidfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.MNI,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czx9assdsl9gzal3s9kyg4xaqvzwnfq56e42v9j5259t3zseemya6w',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    codedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CODE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp23fxem24r4ae8mpxjclvxmxdaqmcy73fn47t5qygtv3v0f6at7h4',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    thcdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.THC,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqdsh7v6vf0qejapfhvpwhwezsrfqnvz4862svls0cmd75hn5f4d6t',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    guhdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.GUH,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp2s9w43nwfeq2hj43lskhytvej6hymt055mj26wxqfra5s0t6p68z',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    fishxdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.FISHX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czrrp80rv4t3h6hxrj36encf0yzcwe8r6qmy8zhxjxfr3dl7l5qr6c',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    wbtcdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.WBTC,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp0jxauual7s7xyvrycn8uqk3ewgvvtlrxmw8ny8syqzpknwtjdvjk',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rapexdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RAPEX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czv0sx44tz2gxczt22rwjd0wnz97p3e8krzep9lh6fs37zh0xhml55',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    easydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.EASY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqurvnkp2e9xetrf70vcvxhawmetgqx937dw4lvwvp2u96ehukve4j',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    securedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SECURE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crku6f4mj2swtumcvrp67ms7h7fyvqrq9a06v9g8lugdz8kvukfhm7',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    headlinedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.HEADLINE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpae08xdm585k50psgfeq5flup3zyv920dq2nx54lcp3lrg7gxxfcv',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    neonshipdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.NEONSHIP,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czfwpcj9n55mkrxula24xanz5dj88uf0k2hlquvgp0kmdprkn3skrv',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    nattybabydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.NATTYBABY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czu2ucjgd80g8gvdtp5ut8g04ztght3nq0fjp8ryt7lp6zqa8t6anr',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    pantixdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PANTIX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp55pvqnh7sr3fvk9drtddtvz8g69ffy949mazuggnw87uls4fu4px',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    scorpdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SCORP,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr6w5k6kzc5qqv0m0r7j3ngrup090zve5p4gtuu5n0jus92zucepe2',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    cassiedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CASSIE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqkxm6lml8qdd40h7gq62eree0q7lh05zm6p83m5ap6hfdrhfmuh7k',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    pumpdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PUMP,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cq2af88qau98ut8mzv2fyf0avdmx5f2wg2t4e6zcx800gy9l6dp24q',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    bobbydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.BOBBY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpz6udhuxme903qsaxeyj8qajvltaf2nn49hxeqqnqg3e2y76scj6t',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    steeldfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.STEEL,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cphtl63d8k86ysg3nm3q42qpnayn0l49glw3dmau0fhkz3rllct08s',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rzrdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RZR,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqfmnp7hejtwv7qrlezt2jw7dd0qaff974fls36ujch3lhwzmrth69',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    dextrdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DEXTR,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqp8uv2tq5rk64rmaqj0n2zy70n9mzdvh4hstc0lzv70lhwcsgjym9',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    ron2dltdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RON2DLT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpaejrzwqy00dygk8qdw7alvr3nkk32774tefuhsgzk8ctmhey9aru',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    hodldfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.HODL,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpz5qe5t9y6ypg9ee3dy3p4ze8kczwy49flcx65wdpjnhu2ken43zr',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    smiledfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SMILE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czqqty5txc6p6sjr95k2xfpl8mlj7e0ppm9l67kf67dftrzlzz74gm',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    paperdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PAPER,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqgzwk95e4pzhjdm3v8k27737z7hy9mh4f6n7uh7u7m9erzfa287fm',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    jitdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.JIT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crmgund9fydsla30uqc6xskkcc770vmgtdvqyr0grjhmxa8qhsxlpl',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    taydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.TAY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cz20df0qwexzn2twdcengr4yrqw7f7j2hcuqmq0c5r6ak0kswwg0hd',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    idadfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.IDA,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp6efxsrqqtslj6s0089zzl2st344lp6p6g2ayly7ld6cgqlne00rd',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    memaidfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.MEMAI,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqeyy97e4yc625w94u4zlx48ecvn47heqp6mj06p838jdme04mn9uv',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    pepedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PEPE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crdahk98klswlt9hrsgllq04lpk7m897pv027x3mvv9nfr2ksrdwh7',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    hotdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.HOT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czjrxp276xz0pn3kxw5grcxcf75fy0jwd9ay475tpm45xadurpcu0g',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    mehdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.MEH,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr2m6ksfj0cgkthgxnnk3ghjvkcw6v97rvt7dcqj963zg2gjsrjk9e',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    golddfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.GOLD,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cq5myf7752rt9mf9ursq7zpegadez7g7se5dt3qzszkryv3yh9jf5g',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    hnydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.HNY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crltp0fel073tqjg4yrjadjhfpjr74skuwctzdd5lkn3dfgcj4m0qa',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    istdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.IST,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqeze6gjd7dtp52tancv5p0xuk04kf902q3fcsmteq0xlwfuc3lsan',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    bobdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.BOB,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czzze5xswgea32jwypmgr4xy8mrejvltnewkflxc0tlq7v22339l06',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    remdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.REM,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czd95ewelyhm76mp2zyumt04pqmx4fq332zrc0pn96l3xn0vnqf75s',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    poodfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.POO,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cq7dncjh4m9f933u3dglcjlu2ketazmcg92kzfnf3l7vemcx9schp0',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    phspdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PHSP,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr044jtw7dk5khgjcj8lvrk5fc5qms0pz4clx2vn0kgwfgu4zmc0um',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    phnxdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PHNX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czthaev0gd7f0vaklp63jxgqx4qtp3ruv6px5a622uqae2lxjr3w8j',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    wavedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.WAVE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crw7lzzt7sr2d80kyvg65tl48q086s44vtmhdkwtseqg4recpna2c4',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    icedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.ICE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czwavnauw3zh0cqgmphmr6026qqmzrw2yjjdnx5zwha5aax0rn9gsz',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    crumbdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CRUMB,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqljz3jwz4at7yphjrwfcgmqek5e7hg3sr48exuqydt0pvcmchkg5f',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    patdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PAT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqa59u7kexauud4qv94j4xca8xg0fuyzc6m4sj5t6p3ct00dflextc',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    edgdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.EDG,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cq2hxexszt08sn2shqussrzcej2j0r6fs8ctghq97wsrrwfksz7q8c',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    mrddfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.MRD,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpu0t9wpjg9jj5r00sch5n0vw3pjrzsglj6cextrm6gsyqy8td3hep',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    nowdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.NOW,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crrxuvqf4l5n9e07aqsxyhe5mnwwnll9ywa668ua4uhhma7f232ln9',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    wowodfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.WOWO,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp4t3jju9rv7dpeeqr3nh3wle0cezjc0k34k6hxd8rtzqzanhmsv5f',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    boxdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.BOX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cza363a5w7wp9x5k45alfj22cuh2r7y99vz3ght7lzrzfkxt6axghf',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    hitdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.HIT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cze0fyjulz7t623x3qjreprj44rtqyjh4272xxq8uwv829p97rh9fj',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    sinxdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SINX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cz25qklr5uc90dr3dewk4224gsprxf7x8qt992tkzgktuk63taftym',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    dandfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DAN,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czu68n6qw8e0p7z0anf9xl02nt0mxklj3h8sxm42djk364jteml5zq',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    moxdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.MOX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr54u8gmjfcsd5kglm4055c0ke4gz5n8gfztfafyaynhvd5k6yetkf',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    wendfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.WEN,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czcec74tungzdu92thhrlcx48pyn7rcux4cqht0pwnngv47q3w6kma',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    loudfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.LOU,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cq3z0e4k2krwnv9qgl99ftqd9w3qtnz7vnsa560d5xw3cwlwavztp6',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    jwlxrddfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.JWLXRD,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cry0vsh37fd2g540fr0ycwhz550s4hd4da0vjuua7qxsqv0adt6kvy',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    chugdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CHUG,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crtzzgz5pry95n3v8mmprpz490jupp3jvykkn8xwu0xe4hmmjnmzem',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    shepdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SHEP,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czu8d9ymdrprgewg46p74w65r64zzpejkzknzukkj8pwh634ye85hf',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    stabdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.STAB,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpjs7nmucau920hd0cn2eu7fvmtm3g4rp38w2xau22uk23cc9a4vq6',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    kwiftdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.KWIFT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cz35fqfnmjee5lvezeh4c8yz4r0tfwpjv2090lnwehwzdmrtpka5y8',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    fomodfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.FOMO,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crynwvl2hp8kmguur8rejznfr8c2qwr5mfphcpdys32a9r69f9v4uf',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    deezdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DEEZ,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crh3f38hzmdjqc2hv9rr7zmtdt6p5xwg8arhx3xamplllvm0n4ds4u',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    alexdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.ALEX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqlmp9vxnjfre0yjtpuze452u62kcysx84l3g48fsmjlcuw89hzcxh',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    agctdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.AGCT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czcnn6v68n354c7q35tcdptuqadcwdfjquydpr7q6cezmernwwzvml',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    pnutdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.PNUT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cq68x63gfjnj430z6fldqf09d0qx90nxtxftpkvt4uykepxj4akct3',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    srgdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SRG,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cz9wkehsp6tv09cf50l84nu807xvjfhgzvdyfswt8t8hsqqjm4apaj',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    dogedfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DOGE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crv604tudqjge5wkngzdqwrwsr2w6vl9uazd54q8allhv07a297gcx',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    imdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.IM,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crut5y53za2sfh5lfv3k7ulz6pgrf9wuft94jpylv6dv6pj36j2s4t',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    duckkdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DUCKK,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czg922ryxd74sde785utvwfj4a7pp44lrxtpre4qls83ykf4uw5wu5',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    ctodfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CTO,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqtlapkcuky0gnh4clw50zar7f36c6n87gdh9wae9cxdz5y8syxlm7',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    slackdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SLACK,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqyjsllt353wn2swm5vp9zjz48xlkyvxl097ncm3qz75fse7cnahx8',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rugidfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RUGI,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqngl7a7ll7xrq9matsgez38k8p95yurt74ar7gwyzzlpj5tjt7ed9',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rantsdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RANTS,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpgu47037m68g3fxeugjnvrh9tk9hffzvd5x00y7a76fq7gddsp8m2',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    radixfiestadfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RADIXFIESTA,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cruk8mvkwpdzvf8u2y4gdfshmc8d7y4k2rarp5faeaav4a34mr0let',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rdldfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RDL,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cz04x9y7l2awdqmchuvr4ujsq9395thapehj5calvj5jp882q6gtlg',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    reaperdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.REAPER,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqxc799znynr7hcmllrwhpfpqz0qtv9vexxc5rf6xrz9pv05myuav8',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    nrlydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.NRLY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cplskrpdmrk6uxpp00jtqemsagrtfvllqzxplj4e0a6ukf7xvuqygn',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    hodfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.HO,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crggsd8szhrsnn3mnypnev3rkv4z5atndxs06mfcsy4lt0qf7lyg7u',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    nearlydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.NEARLY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqz7gjflul2eng5nxnfttrcsjpk8zt8ryptmhqnv4vx3m24x4ylxqz',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    wtsdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.WTS,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpzs3azq8xdtfdf6qqlw2dlcfww3869dj3n44pene6nl6wc4kpud7n',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    gnodfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.GNO,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crefrf6zf0m8zmpw9v44awma44srkrkuur5ltwafs6pdludhzy04hc',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    lockdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.LOCK,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cppg32hyx05k9dtjwxkyyh42danewe8nvngk95wr0lawmlhxxn2m44',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    deliverdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DELIVER,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czp5ynupfuzqtuvklwktf6y595glxx4gte7ztcc6sfwde8r73tc5ax',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    greatdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.GREAT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cq67pxn9c5nu324nmk7vj46spr4e7p8dlrlmj3k5ast48jsd9c5yk5',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    cvxdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.CVX,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crue06ycqscdy8vtrsxn8u5utq0lcxaf0sht9nh2wvqq0k5hk42q4r',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    delaydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.DELAY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crkcydkm76r2y78p2ddssdy6fj0msrf00pr0vdwn6k4phd05qvdejz',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    zoomiesdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.ZOOMIES,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqnavm9d8u9rplpxs8vgpgk56vzcpprfyycmyskxnll5zzjvn20nnt',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    rwtdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.RWT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cplh7x97lj3n3qkz9mr2zy46zkmvfqg97rdcskfumscyn3gwee4exx',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    whydfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.WHY,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cr76jnxt35zguxmc6826cx99mssr7w0zwr9v92xk3ce58s4nqr67kt',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    stillheredfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.STILLHERE,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpcc2tjyzpt3w3qqk76sed78fncw4j9rdcz3ywaelmg9p0auz0kdqz',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    glessdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.GLESS,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqzhss6nh27rus8ealm2pps3cdtjkz87jja4v7k02xdge89txgn96v',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    lsulpdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.LSULP,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpsra50dncv2vkp0nxgwla5zvw33fw0y7nv6fkn8cpxj9yj8cq70xs',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    adtdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.ADT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crr2j9e9lvc5w66tn0zt2r3kcxj4uwanvev75ha8jf0xvt0gsx2p2q',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    astradfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.ASTRA,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cp47gc4mdty4w0a7s4ffj9txjkp0hp3738s4m224y95slvmfv4fftm',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    kglddfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.KGLD,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czy5lvw8vfu5509n5fajnfm7du23xce73ca4jx378ndun58c0y929f',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    unitdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.UNIT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1czxjl60rhatz9tt0zk00sxcrasdjs3n7pwlsq7lh9gpdqf7z9t4lwh',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    scryptodfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SCRYPTO,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cpakeqyhgt2pgkv3at8sp46m8zf4yndp0szdkf4lzfhsvkt9kcc4q6',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    kurddfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.KURD,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cz0sr4vnj20g0jtrt4g2w3xmltqsk6d97ewr5mw78yv7mx27d30erc',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    giftdfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.GIFT,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1cqq8czsaan3vnv8ajxp3m6xf3h5vj79eh3sqsnnhqr0pd38v0rgl4n',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
    sastrldfp2Pool: {
      type: 'component',
      baseResourceAddress: Assets.Fungible.SASTRL,
      quoteResourceAddress: Assets.Fungible.DFP2,
      componentAddress:
        'component_rdx1crpcg6vsqz6wek5mqt3262xn5cjrct8t44zn7m4yunzjd26k2mynux',
      basePoolAddress: 'UNKNOWN_BASE_POOL',
      baseLpResourceAddress: 'UNKNOWN_BASE_LP',
      quotePoolAddress: 'UNKNOWN_QUOTE_POOL',
      quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',
    },
  },
} as const;

export const defiPlazaComponentSet = new Map<
  string,
  (typeof DefiPlazaConstants)[keyof typeof DefiPlazaConstants]
>(
  Object.values(DefiPlazaConstants).map((pool) => [
    pool.componentAddress,
    pool,
  ]),
);

export const defiPlazaLpResourceAddressToComponentAddress = new Map<
  string,
  string
>(
  Object.values(DefiPlazaConstants).flatMap((pool) => [
    [pool.baseLpResourceAddress, pool.componentAddress],
    [pool.quoteLpResourceAddress, pool.componentAddress],
  ]),
);
