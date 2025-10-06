export const Assets = {
  // Network signature resources
  Signature: {
    // EdDSA Ed25519 signature resource
    ED25519:
      'resource_rdx1nfxxxxxxxxxxed25sgxxxxxxxxx002236757237xxxxxxxxxed25sg',
    // ECDSA Secp256k1 signature resource
    SECP256K1:
      'resource_rdx1nfxxxxxxxxxxsecpsgxxxxxxxxx004638826440xxxxxxxxxsecpsg',
  },
  Fungible: {
    XRD: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',

    //wrapped instabridge
    wxBTC:
      'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
    xUSDC:
      'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
    xETH: 'resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww',
    xUSDT:
      'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw',

    // wrapped stable
    sUSD: 'resource_rdx1th3uhn6905l2vh49z2d83xgr45a08dkxn8ajxmt824ctpdu69msp89',

    //ecosystem
    OCI: 'resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8',
    EARLY:
      'resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s',
    ILIS: 'resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2',
    DFP2: 'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
    ASTRL:
      'resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3',
    FLOOP:
      'resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9',
    REDDICKS:
      'resource_rdx1t42hpqvsk4t42l6aw09hwphd2axvetp6gvas9ztue0p30f4hzdwxrp',

    LSULP:
      'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
    HLP: 'resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m',
    WEFT: 'resource_rdx1tk3fxrz75ghllrqhyq8e574rkf4lsq2x5a0vegxwlh3defv225cth3',
    hwBTC:
      'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
    hETH: 'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
    hUSDC:
      'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
    hUSDT:
      'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
    SCRYPTO:
      'resource_rdx1tkff46jkeu98jgl8naxpzfkn0m0hytysxzex3l3a8m7qps49f7m45c',
    WOWO: 'resource_rdx1t4kc5ljyrwlxvg54s6gnctt7nwwgx89h9r2gvrpm369s23yhzyyzlx',
    DELIVER:
      'resource_rdx1t466mhd2l2jmmzxr8cg3mkwjqhs7zmjgtder2utnh0ue5msxrhyk3t',
    HUG: 'resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97',
    DAN: 'resource_rdx1tk4y4ct50fzgyjygm7j3y6r3cw5rgsatyfnwdz64yp5t388v0atw8w',
    BOSS: 'resource_rdx1tkdq52kvvx7lqfp8wtpfytzz7tls6atnjqf669tm3nvjvdxnctwq9g',
    MOX: 'resource_rdx1thmjcqjnlfm56v7k5g2szfrc44jn22x8tjh7xyczjpswmsnasjl5l9',
    JWLXRD:
      'resource_rdx1tklsaw4evqgmue59v7c87qm79tx2ppjp93ycxek8shrlmz426h7axq',
    CASSIE:
      'resource_rdx1tk7g72c0uv2g83g3dqtkg6jyjwkre6qnusgjhrtz0cj9u54djgnk3c',
    EDG: 'resource_rdx1t5vjqccrdtvxruu0p2hwqpts326kpz674grrzulcquly5ue0sg7wxk',
    CVX: 'resource_rdx1th04p2c55884yytgj0e8nq79ze9wjnvu4rpg9d7nh3t698cxdt0cr9',
    GREAT:
      'resource_rdx1t4mthq86ck3tc05eqwsu6538m2a5nv0wc40ysmpk4fp6nwra80glpw',
    FOTON:
      'resource_rdx1t4km4k306ul40s3zr8zwwrm25xfmx7w8ytjvdwqh0u3kkch0eph9rn',
    IST: 'resource_rdx1t5muwkqqthsv2w25syfmeef3yul6qc7vs0phulms2hyazf9p863zpq',
    SMK: 'resource_rdx1t5h0252zhla4qkxhruqglf46vufx067py8e98v3rthd0dnqfxn6qta',
    WRP: 'resource_rdx1t5vhfqw8ycmcgw0jz0wujyqxhgsvp0r55nqdn9qmkh6jha87t0tcp4',
    DELAY:
      'resource_rdx1t4dsaa07eaytq0asfe774maqzhrakfjkpxyng2ud4j6y2tdm5l7a76',
    PHNX: 'resource_rdx1t5z0jeyg2k9746kyvgcvg6pqsc0zhg0hjnvtsq03j77ezylv9pyljk',
    IDA: 'resource_rdx1thn35hp873d6mmev4a0g4z9all24lpmxgzjgjned5qadvhmjg605g6',
    HIT: 'resource_rdx1t4v2jke9xkcrqra9sf3lzgpxwdr590npkt03vufty4pwuu205q03az',
    BOB: 'resource_rdx1t40gu7xfffcc723ylrfq7gw7g94v9qjsq7e49ue8r07afz0q2v4qjx',
    DUCKK:
      'resource_rdx1thah6ym2afv9l75fxm5sfdepkcerehyxlyw5uu3yrq86vr480848z5',
    UNIT: 'resource_rdx1t55t776pw2srzxve5tfjzexdp2hyc2num93meq6834nsx9svwjypyk',
    CAVIAR:
      'resource_rdx1tkk83magp3gjyxrpskfsqwkg4g949rmcjee4tu2xmw93ltw2cz94sq',
    RWT: 'resource_rdx1t5qfksj2sc2zjsmae46ukpf03ludvzefqk3mrjpysnmqww8uujpxj0',
    CHUG: 'resource_rdx1tkaal53azemtfax0es4g6xfy9mpj2x683hh6fey7gm4lcj53u2h2lx',
    LOCK: 'resource_rdx1tk4juxzn2c64khzv3dtku9kl96h77g45ul6kwrp0ul9ddfvkm4hqyv',
    RWA: 'resource_rdx1t4k6qmpv7krl9gxc5v7ss6fl4j7uuelkaftfz4p49ejd0zj0xs2pwn',
    GIFT: 'resource_rdx1thxuqqsppfwsp95zy9p3t73tvzhqq40w7wstgwcqgv9ceavvja6hkq',
    RBX: 'resource_rdx1t5lenm5rr0p7urmcfjpzq5syt7cpges3wv3hzefckqe49ga6wutrhf',
    DINO: 'resource_rdx1th2cdulgwtg9pj2eylrwj5jmfh0qax66jvyhdtk26z70kyvtcln375',
    CRUMB:
      'resource_rdx1t5xg95m0mhnat0wv59ed4tzmevd7unaezzm04f337djkp8wghz2z7e',
    KGLD: 'resource_rdx1t49stmluppglp8ul6tv4cncs5qzvytkmvfjmmq3jkncf6dyj3qxvsu',
    ASTRA:
      'resource_rdx1th6ne5yjpd8vqzxt0w76qkxg077z7glxftv42gqvmxkvdm8ecfxlsv',
    DGC: 'resource_rdx1t4qfgjm35dkwdrpzl3d8pc053uw9v4pj5wfek0ffuzsp73evye6wu6',
    FOMO: 'resource_rdx1t5l954908vmg465pkj7j37z0fn4j33cdjt2g6czavjde406y4uxdy9',
    MXRD: 'resource_rdx1th0pjp7s7fesstuj2hcggtxphzw3wc06qx5zrx0c6lsg0xalyt0nn0',
    FUSD: 'resource_rdx1t49wa75gve8ehvejr760g3pgvkawsgsgq0u3kh7vevzk0g0cnsmscq',
    RR: 'resource_rdx1thmvxfv5yngqf29vv58cm222mp9r5fxe5yap6w0dqzudrzz9yjxn86',
    HO: 'resource_rdx1t4zhahqu36n67095ys25chvjsfrhe2ma234fx3uu863vn7ytwmg5vp',
    SPED: 'resource_rdx1t40mskhc977paq5trz77jn3zmk0r0lzvg6nwxlaqsgfcaklmrekdgq',
    GOD: 'resource_rdx1t48nlyuqh3pyy7xhrdud7gag398sejyxnp8q9mu3hzp8dur4mefnta',
    MNI: 'resource_rdx1t5fut5566uvkrgf6fltt7pxcdcjs42ydgc5tm3gj8qzaag7xkqn4lg',
    DPH: 'resource_rdx1tk2ekrvckgptrtls6zp0uautg8t34nzl3h93vagt66k49vh757w5px',
    SOAP: 'resource_rdx1t5rvhk2kpupjpr7nrlxnhudr6h2y7yvq2vmlncc7a9y6l9ej4xgshe',
    GNO: 'resource_rdx1t5ga4hl9ufj9zmjh8lqupdmesu60tl2zy5wnk28wsldgqd6xja4nyh',
    SPACE:
      'resource_rdx1t5y9jrqywckfuqwj589l9cpfmgqlc2zajm2szwhyn460mv2zyxs5j8',
    HYPE: 'resource_rdx1t55r7t502se3z5jzqew36ly8sw9mkpkxewmrts6pnmypn9sh8ch6xx',
    RAM: 'resource_rdx1tkdfm4he6dc7jth6qnj8hzzjhchvqe238up4zxxhsrepynryxx2y69',
    SRG: 'resource_rdx1tka3kqqkjxcpddvcx0u300qt66z3tlzv7swqx9rklp60m5yqry6yzk',
    DDAN: 'resource_rdx1t5z0vnpj33s5x8nkqef530hh6ygngx5r77u05ullv5gfaljdx27zg0',
    SLFI: 'resource_rdx1t5zhavnxcvfxuyd4knqtszu5ep2vdsjzk0837dzw8tk7k3rzs4kpa6',
    PPCAT:
      'resource_rdx1thmdte26x4fk4944cunw6wen89y5kmdlewpkx38cj62er804mgcck8',
    GNRD: 'resource_rdx1tkf56rwzta4qemw5vrrwgf5xlkvdg5huxp26zsfrt6mm3x5frnvzeh',
    FADE: 'resource_rdx1t4dxe0hg8xu26uxm4eueqcgxn8h3yf4ue48acap4wfwarp0fl8kyed',
    STILLHERE:
      'resource_rdx1tkc3awevlsyxe6rg02a20kr9m3dhagkun8jcd9avqjufep4n9srsuu',
    CABAL:
      'resource_rdx1tk8axnxm3nphywtxq9535p5qkv804luetmjj3gfmsyjklg8r0nj74h',
    RUGI: 'resource_rdx1t5dhems644u276k9xukahwqjjtaf5wuchde0c7dkvhlss877d6wp3f',
    FLUFF:
      'resource_rdx1th7yhkthgu2psztkgeg68tnvv92hkz9lakgl3kg67mc6e2j7qfhyzc',
    RADIT:
      'resource_rdx1th7jrjlpfz5dxtpa6v2thsxarqa5mgygcqm8qgm37ntyy6dj7l7dxs',
    MRD: 'resource_rdx1t5u04cs3u2yxqkcwku7jdvdvv9cu739jsx0rdwu97682lr0rn92qdh',
    EDWED:
      'resource_rdx1t59yfshmwkquc59ck5hhnzn4qukfm96v83eczscnk7t0ajz5f6lect',
    REAPER:
      'resource_rdx1theujy0gwa05u6qlez9u7gl3y8d8ruhd7gvy39hrcf9pkv3y9vzx3w',
    RDL: 'resource_rdx1tkmr0wqa3p0v684gvqqt39t8vk8uh84434lrsfndk2n63y98hf3p9z',
    DOGE: 'resource_rdx1t58ps0c9qt2w42usg2e00u9fxq4rzc3r9erdx6ceyvulq83rp3s9s3',
    BOBBY:
      'resource_rdx1t45js47zxtau85v0tlyayerzrgfpmguftlfwfr5fxzu42qtu72tnt0',
    SINX: 'resource_rdx1t5jp9haxx5gh5c30jr46afqr33gh7pm409a4urxvmr765d8fs5wjn7',
    HNY: 'resource_rdx1t5ahxgjglsvj4dah68el8vp5pdedmwrd4lp9ems6sjrkp3dycy0d7x',
    DOUBT:
      'resource_rdx1tkjd8w6wcm3suwtumaffd2fxeqsdgzq4ruempfnyuk98dkehwxtpq2',
    ICE: 'resource_rdx1t4h4396mukhpzdrr5sfvegjsxl8q7a34q2vkt4quxcxahna8fucuz4',
    KISS: 'resource_rdx1thlu58hy7sf7xdwxj67xh0v8fqawgjktnrpe3dw362wpf4zsnc9vmn',
    BURN: 'resource_rdx1t5hjzm9reale3yfnrr0a9ff9vysjuxlruyjrtwapjuz84c5kdaan8y',
    ZOOMIES:
      'resource_rdx1tkfga72frk45fzp8mhvu85ly0xu64jq27jj82xk60lvekx6pqjg7rm',
    ERM: 'resource_rdx1t4fya9a6f6eavrr44xlyxpwssq83q770f90ch6r2qcja8aq9eygr55',
    JIT: 'resource_rdx1tklqwvhfsm968vpnk03nn9g7kqp28h5du4x7mxnhjtqvq5jy97864s',
    GAB: 'resource_rdx1tknu3dqlkysz9lt08s7spuvllz3kk2k2yccslfpdk73t4lnznl9jck',
    EMOON:
      'resource_rdx1t5y9qggzzsrxj05veq3uy2er3wtctp8hwqw0dvgaxkve2elpqk290u',
    WAVE: 'resource_rdx1th6vehg654lvwvf9jlrysmy7fn2w7nhfgfs96f0042tfq3a0l9gwkw',
    PEP: 'resource_rdx1t5mfmxcwmyeda5v4wdyhqu0qe9lxgwh50h20gaungacp5xge6c98uk',
    XSE: 'resource_rdx1tkkzy2zg4na22kskk00q50v0kghw89akeh84u60xczxsr0ynes80d5',
    CTO: 'resource_rdx1t4t26wh39qxydm5lhfcelstyrh0kr9dtcn6x2nsf37wjjrlj95j9ms',
    GARY: 'resource_rdx1t54934f56dh5yuw79evnafk35we3frffdyj5rlz3ksumd0k7ecq2h4',
    XING: 'resource_rdx1thych7uvw63k23hnweegv4c9zw8szwerl2qnnk5szgrjwj8vzxppp4',
    THC: 'resource_rdx1thdd4yz5jvs5kw73z5a3t4gj4aekzfusgah8mzdays5ywt7vv05yen',
    RBOY: 'resource_rdx1t5lh6ejf8ny0ua33auvg2fzfkv8thffyxap9r904r8qdwalrjjzzpa',
    DGULDEN:
      'resource_rdx1t43srxdw79mlz6xa74sav09ke92jfyf8mnm3q9z64kdjh3tnhye9c0',
    WBTC: 'resource_rdx1tht8xmacjp30r9s8ymw2m200munnq78ja2dpaza8k9frpncaz94t88',
    DEVIL:
      'resource_rdx1t49pc9eec9qz5fr3uw95e5q3ykh2lajlqxulkplfp3qe9tgmp5dspe',
    FFS: 'resource_rdx1t5qn03jk089p9vap7jqt85c0q907kd4wuqkc02xgmucn2hgs9wnldf',
    PLANET:
      'resource_rdx1thn6xa5vjdh5zagqzvxkxpd70r6eadpzmzr83m20ayp3yhxrjavxz5',
    CXRD: 'resource_rdx1tk99y3lft3em0hpmf6hxhsmksslu3q772r2e7wmef6shvtr3qxpwz6',
    DUMB: 'resource_rdx1t5kja6cmjqxaave45ez0wl4fq3ym6u20urx3cclehhxjpusnnslp76',
    STAB: 'resource_rdx1t40lchq8k38eu4ztgve5svdpt0uxqmkvpy4a2ghnjcxjtdxttj9uam',
    RAI: 'resource_rdx1t48cqaaqweyme2tnaqwtyr5669dxvlywpn4s7mhd8k6fdr3lhd89zn',
    WEN: 'resource_rdx1th9kn2k7av0k74e2y40defn2ake2zcrrlnn9nly5ws0qpqursr2ypf',
    SHARD:
      'resource_rdx1tk5ktj0tpvv7jsgazsn504hgugx9j3tefh8hkfncz04z7lvzalhtcv',
    WIF: 'resource_rdx1tkc3arnc6fdhlc9c9nf39y6mvz4uydwaaws5rl2942atcv90ulw23a',
    COCO: 'resource_rdx1tkecm7jkczxc5lmvwpg4am5762c0zjvn46feqlqep4a99e4l5cl0hj',
    SHEP: 'resource_rdx1t460aj5949cwsrggavjdst9qz8su3t4j94w7yzxefg9ahgzf0zps9r',
    RDK: 'resource_rdx1t4zrksrzh7ucny7r57ss99nsrxscqwh8crjn6k22m8e9qyxh8c05pl',
    LUCK: 'resource_rdx1tkytd6ljn4yy4fa3a2yqxlmglw2q6g0tfchzs02ywgx5xypfh3m0hn',
    JTM: 'resource_rdx1thw0cfmj70kn0xc0sgvchz04cfry9lwnd6q553jg8mhp52d2jvru3f',
    DEXTR:
      'resource_rdx1tkktjr0ew96se7wpsqxxvhp2vr67jc8anq04r5xkgxq3f0rg9pcj0c',
    CERB: 'resource_rdx1t52m6psjwzmg9vt83d3tsalzwqxwzheftatsmvz7aflq7nj07rtrr3',
    BALLS:
      'resource_rdx1tk8adlu9vc94a2m3gnerfsx5yg908sgw38nfchw7x6rl3ynumyaz5t',
    STUFT:
      'resource_rdx1t5l9wg9mqzhadcre0d3wrrryhhlx2j028glthu5p3srzn7uhmkx4as',
    DNT: 'resource_rdx1tkqadeq6hatwv7cvg46g7e0kseqmltlsh9mp3dzhgvlsvydcrjrrxr',
    NEARLY:
      'resource_rdx1thmq2j4eczsqlhtmv0sqcwphn7r4r0mwxat65q3frpsfrx3056f3sx',
    POPEY:
      'resource_rdx1thl5c03u8kjy0yc7fv6zww46e7nyuq6cq76ncdxknaqgp8mu5elx2h',
    RDS: 'resource_rdx1t4nxvalrqpqaxv9cvmghk5yyl5u47mgj33npthwfupszvm8ezgy5x0',
    MEH: 'resource_rdx1t5rwvw6sylv69kj29dpgd9f5a352kxgc7gs08t0vahp03ztdxuwfn4',
    SHRK: 'resource_rdx1t59ua0rj55u8f2ef8mrtpl6gs5w98ndkhsk5p7e95hwcfr3q73tm2u',
    PAPER:
      'resource_rdx1tkux7w0wjev74gkga4087zexqk0v9yfkstmx2eupanj39tmanqcj0h',
    PENNY:
      'resource_rdx1t4ksum8flxk7w7l2lwx49jnd8zds4yckqmxtc3cadv9dylluddx0ym',
    TRUMP:
      'resource_rdx1t5aty50d4mh4vmt8h0ldzvh0zxlvhjlj2gmzxpym82vzq7g9axmwe2',
    HODL: 'resource_rdx1t5hn3rcmcphhmmwk383au92xw3wl72n7g98s0rpdp35lk4hr8sudnx',
    RON2DLT:
      'resource_rdx1t4p39fd9n7zr7jpzljdha25axxlhcmtwqwt2a0j2tn9hkrjrn0yfwa',
    PUMP: 'resource_rdx1t5fml6k3hs9w2563syafujxxz5sh9qjaekfcf4jzek3axde8n0p6cz',
    PEPE: 'resource_rdx1tht5kjm0zcz5hxzgvgthq23grrjnwy5u3fs80ft4tu3ny2yf72ehx9',
    VKC: 'resource_rdx1t59fuustx3gthwwm2s3r77afaddrwsms7hd86egm6rm38nwzv84393',
    DONT: 'resource_rdx1tkmv27cmkllnfju7pmk25926fdgc83f32k8d90lkj3rjawfwkedley',
    SLACK:
      'resource_rdx1t56h9gxwkj7emgf52u60nq5ak9nmjclu8xfedjsr6hpvjlxq0w4ftq',
    ELON: 'resource_rdx1t5g8yx5ksd43t28tcdhmyn5dtfdjfmlfwyv80z8mgcazxwtwkgdjpu',
    SIMPSONS:
      'resource_rdx1t49jgh24eslhj7nfxtqs6z6tqa54hgrn4snhyud4ntfqxhs680djcu',
    HMM: 'resource_rdx1t4w4qg8jazdj4q6jg5yaftkp9xeglxaks06cc8wf8lk8pvxmm3rd6g',
    GUNA: 'resource_rdx1t4sdj05ew2ynyjlacralt6kplzc7k5s49e9g58kh5nl59avh7v72n0',
    STEEL:
      'resource_rdx1th97uresrzurjnygxm5sm6h83m2cqu3v78zk4c8f2et7n658mqrvu3',
    PRICE:
      'resource_rdx1t4jfhs0fkmwgjpqz0y2fphzj7wx66f2ltpfsd6k7fzjym3vtmz38v0',
    CATZ: 'resource_rdx1t4venxu4j4p3fym0p44sn0w69zeyc6kelvc59ss7pu2r6uggwdhu2l',
    NOW: 'resource_rdx1th42ay5yjg6ujak3ygnc6yerzx0ld622chz5tlnwjr7elcp3u48l2q',
    SCORP:
      'resource_rdx1t5egwd52s2xemaa6r8jkhj0vs4q82ym93efn4g4267de4fwnfww7cy',
    LAMBONAUT:
      'resource_rdx1thwkdlmvhd4qryhetr0csadgchlgm3yrw99ytrzzu2e70nluqrn0ha',
    PZZA: 'resource_rdx1tkvh4w0xf2p5k85sy3ekrnz80jlekxe7n88jk0cmn8x0kdvn57tjvn',
    CHILL:
      'resource_rdx1t5kuv6fhkfjwjrvhpgvzxcxtw86zg3d92cdsjjlz3mc5gzu0m0y3g7',
    SHINE:
      'resource_rdx1tkf0e58x7k94hekyzq4fza75dtc294hhl64e20rst8kysth5lc43dd',
    RGPF: 'resource_rdx1tkm4wwekx537qx0n3lnrg7dv3h8hftzjc73ec0xs4fqcedgnenh5n5',
    TENGE:
      'resource_rdx1thz58tn2lxty7ey0mqv42e8akyg26rhp55a5pgsyx3rjxf7jmss5gf',
    BRO: 'resource_rdx1thk3mv7gtr7vuy98ssxpd6khlxd4e9dwkfdfacdksx4npltcdw2jft',
    FLIPP:
      'resource_rdx1t5hn96q9nfrf6rx0xfm3sw6028xdt93l2pehhg86vzg3v3uvrhqye5',
    MGC: 'resource_rdx1tkkqmvn3jr2e6yhcfjyutp4hpatrx2g83dzgxg0w723mml0acd96wa',
    RST: 'resource_rdx1t56e5z78yxa5shrhu352pk9uczkwj2zqe6fdhy9hgj9058a028knul',
    FUD: 'resource_rdx1t4nawxpph0taqwqma379augxrrn6u8w28yrv0p3gxpwj5h34gmqpp4',
    TWERK:
      'resource_rdx1tkygu9fempxqunf3fmqn49nrjxqxphhfyk0zdzxgjc7mk3zczpqhkh',
    RZR: 'resource_rdx1t5w44wm96zsqjq4a2s2qxxarlay9hdwvcm68fudscx3262yas2xm0e',
    LOL: 'resource_rdx1t5ydyme66j265mg08gewk769cy2ldltwect87h80024re88p90sg62',
    HRB: 'resource_rdx1thwcjhwp2f7jk3hjmxxmctln9jjq7w9nvd9xjuyet3cym0ttww47vk',
    CMON: 'resource_rdx1t54h37ew56pvkv6ag6gw3cmjwspts6twsdtc65r23k2cs8q5qgu727',
    CODE: 'resource_rdx1t5k3plpy230tvevr6guul2m6jpfpyaqhw4dp50tx5hjevz7e8pt8t4',
    GUH: 'resource_rdx1tke67956ms5528k9qc89m0n8wm0yjmhhx06xl7k6dv4k4jkmnt986h',
    FISHX:
      'resource_rdx1tkl5zn7a6ldtjdysgy59q5gt9nzj4dr9n5dnm7cmqnp6kj2t64hycv',
    RAPEX:
      'resource_rdx1t42n9kvf9psenuxe55md57p3n70dscpkraf4mnwtwrfplnfcar20az',
    EASY: 'resource_rdx1th05an3njx6d2wkgv03de0c2tp7gwxj8apdvwsaejemx2jcu27vch4',
    SECURE:
      'resource_rdx1th3y0tj4zqs7vlrqukwqqstv94snkew9af2lqurvj6cp80hafc86xs',
    HEADLINE:
      'resource_rdx1t5yxksa7f23t3yaapuzpyh953xz5tmcxn2ycc2vm9v9ywurcjngu48',
    NEONSHIP:
      'resource_rdx1tk2s5h3lf8qncg5jmcsuh9utsunkp69nmlfksjzgjs9lz3azy0g8c5',
    NATTYBABY:
      'resource_rdx1tk8gyyps2key75yhx2zf4z9sf5rk8yydykpqznygu7nqq79e68ce66',
    PANTIX:
      'resource_rdx1tht6klwfdez8yu8wlr0tcvd5hwsathlh3eyqsslxp9wun8hqc6jg7p',
    SMILE:
      'resource_rdx1th2mtmt5rt9x9gp5uusqvj7pz9ghwm9h9ycqpdnvz8hkte3ctwkfsp',
    TAY: 'resource_rdx1t4m8ze9x87wad2y4qqczg93de4n08nf9yktlm2tw5zvzl589tgxvae',
    MEMAI:
      'resource_rdx1thrph7d43yq0gy55x2vhddqvp0ffgx552gzc2a6ctjv7xgrwqx4pd3',
    HOT: 'resource_rdx1thhum5v68722dv766f69x8hnj6jl9hhpx0l84lzemw5zlrd7hwatmv',
    GOLD: 'resource_rdx1tha6wyf7jms3uset6wzmgnp9uncy46ulnv2avxl9jpzxwv3el4wc5x',
    REM: 'resource_rdx1th7uzxgm663pdd5ujappkelaqcc3789q99t6cj8h5634rhyu269upa',
    POO: 'resource_rdx1thhhewhex3hrpx2wterpw64ujhthl42gclr8xhwncru28hxhh5dxhn',
    PHSP: 'resource_rdx1tkp4meuzt92an6ejcc4j2huprpuw2uqx926kpa7fwesam6rt9jmkcg',
    PAT: 'resource_rdx1tkhcenqq4kh5xwkhy7e0ekv9tcdnrs4dgldgmwf84wl44qx39mx7xp',
    BOX: 'resource_rdx1tkl7neutr8v8zve44gvq8x6amkglwkp3cmdd2kn2s439c3k27hql6m',
    LOU: 'resource_rdx1tkdawplj3jq5wtfc2p08kahklkl5p8pvhuz73dmvgr6qg449guhr2s',
    KWIFT:
      'resource_rdx1thxy3h8lgqc4qqua3ewhu67g69xq5anxfcx4x8pj2t0grp7tqx8y0g',
    DEEZ: 'resource_rdx1t4cju5augmhd04f4dhx03tmz0l00rv2hg8p49fm3zdpr2gp0h5q3xs',
    ALEX: 'resource_rdx1t48fqzpamfzxcvyh3d3cruc45zkuupfcj22zp5vyqp38hs9sxslsrg',
    AGCT: 'resource_rdx1thuu2juv0ultv6nlv6dlr8a8pnequ2lsyat02p5w6arrqw3hkzw48h',
    PNUT: 'resource_rdx1tkdgut39qmg739t8sp2kllmrw28gjmwxfwxzhpr4l0rqwzjn5mtzeh',
    IM: 'resource_rdx1t4tz589hsnu8nhksvm0wprcvvxwjleszf4slqkvpkqztemjxe0867r',
    RANTS:
      'resource_rdx1tkwcppartxcqshugymhryertam60wzxftv864cscucud4hg7uhtnv8',
    RADIXFIESTA:
      'resource_rdx1t56l6lac8x0ydvedkhp5tf877rjd0kcrr83ag2qtgxmu8g0peuk2wu',
    NRLY: 'resource_rdx1thgcx3nez5gm8zgyvekvs9rr7vk3wu3a477lrzlwpqhmdz5r5m7r3c',
    WTS: 'resource_rdx1tkp3z52zaxjud3my7h9jfwyr38yte68092qc843nzxayp7hsjh6tjy',
    WHY: 'resource_rdx1t4hz8agr8qtkfn7q8prtc0vk99hzmz4mkncewahsysud32220pts3c',
    GLESS:
      'resource_rdx1tkkde9t95hjxgpv3jr5vqjk5tua567en43fa4m7ytde33ee027cv9j',
    ADT: 'resource_rdx1t48n3wez5ezz4365rg3zq2a0lhzp5pnhky9lz72ng2jj0f0nal56t4',
    KURD: 'resource_rdx1thuj8jzt2wpt2vwpmtxdy9djqd8cjq6huqejlvmsjhl96a2hwy2gla',
    SASTRL:
      'resource_rdx1tkm0z9pkz0e59yf2258drzjwaq7axtcf2mupjz2ag9kwww4jvdfd6c',
    ELT: 'resource_rdx1tksj8qdx0kg3r8yuyx4lvgkf2xwnna28s4cm239538xq2x2hshfwf8',
    SCAM: 'resource_rdx1thunnyrarlduxy0x4j7sedzfvj0cxjf8cgnfcl7xn756txy7xcdqkl',
    NOTETH:
      'resource_rdx1tkscrlztcyn82ej5z3n232f0qqp0qur69arjf279ppmg5usa3xhnsm',
    NOTXRD:
      'resource_rdx1t4dekrf58h0r28s3c93z92w3jt5ngx87jzd63mgc597zmf3534rxfv',
    NOTUSDC:
      'resource_rdx1th7nx2hy0cf6aea6mz7zhkdmy4p45s488xutltnp7296zxj8hwchpf',
    NOTUSDT:
      'resource_rdx1tkafx32lu72mcxr85gjx0rh3rx9q89zqffg4phmv5rxdqg5fnd0w7s',
    MRK: 'resource_rdx1t4nx97z9lcxlcctpug6h8ml4wkkrnpw45v7su4wywma7zlsd5g38v9',
    SWT: 'resource_rdx1thshg4sfau468h5fk4t8kq57372wrt2llr7xxqa73jq020unqzd0u5',
    SLG: 'resource_rdx1t4mtpqwly2p8pes0camm8zsalknyaag2qee9ks34y990zrcjqnmpal',
    FIRE: 'resource_rdx1t4c9gsj7y54af4pytazln2x625mh38aente57v0yp6ynlsefhtwsd3',
    PANDA:
      'resource_rdx1t49v3y5ppatl00skf874psk5sxss4p8xqk07wp8w354zzzw2g7r6a9',
    NOTBTC:
      'resource_rdx1t58dla7ykxzxe5es89wlhgzatqla0gceukg0eeduzvtj4cxd55etn8',
    FARM: 'resource_rdx1thwnkqulk4jtj9gyf2glt9ulrn9mhk8vzutjgce6a9d6m6z6lna8s5',
    SIM: 'resource_rdx1tk5wcr6pfer5h972gf97na0476ajktzfpwsd0e5c2y2jphrc5ttgje',
    MNC: 'resource_rdx1t4xdew5gwdjshd0mlas6nqfeswrxhru8c547z59hfwwh6zw565a44x',
    BLSS: 'resource_rdx1tkn5jcul0fdrtua60kkaasxl8592c2d0g2whas78eeqx8wur9tlzql',
    ZRCK: 'resource_rdx1t4tzgxlmq93c2te5ackj6v6qy8f23k6tt5rf7g3e3q49c2jmnn8tn2',
    NAKA: 'resource_rdx1tk4xpe0ghq3f66n3a3tn62n3zy7xps33ne2j8sts2jaf8nqgvlkc2s',
    LONG: 'resource_rdx1tktu6gxvty5j0w0pkp3j8lv3wk348856w9wxk0ccsh0mz5sn5m92e8',
    ACR: 'resource_rdx1tkpdf65wx7jcru0y02rrejfqn80kq6jpa8t3asvl72uq4ht9zzvsvx',
    CREW: 'resource_rdx1tkcghk0v6ajyt38a67cj94x6rk2f7v7krertpc7p779h4sn5nzx3nj',
    RDV: 'resource_rdx1t4gj05apzajlazm0jea4avg7hdcm8n8mv8faex0sv2vguzcayhjll5',
    XPEPE:
      'resource_rdx1t4lqx3pzazlfp0e449ued6mmmfysevc8r2tzrcj70kpnlwt9kdpgf8',
    XXRP: 'resource_rdx1tk35r6nlyjnt0aqjv7re27gu72ly7d3dwehe9e5k2nwjaue8fxtpkv',
    BANANA:
      'resource_rdx1tkqqz8zs5u4l8l27wvggyke23x7fn27tu6t3d5mgeq2cuqu0vjz3vu',
    XCRO: 'resource_rdx1t5lwaxl3f6f88mtxvhhq6jd6dmv6u0hr9ssrqhvg3a8vw92yau4w8a',
    XAAVE:
      'resource_rdx1tkyw4z4dxx8zwzg9qyu2fxjj9my5pdmzhs75unt03yxrrufvs3d786',
    XUNI: 'resource_rdx1t5ytfqwtqjfyq2ku0n5r4d275h2uc9cx0s4l6fghaffgnvsatjw6hk',
    XDAI: 'resource_rdx1thc7mxrzd3u2v9nfd8zm52juswrsk9f74gqmzk5z46ap2vqk6cut3e',
    COS: 'resource_rdx1t4hknuq6afh7tcx6ysjvku82fdq2laaf3aw80us5df48rpyf2w8l55',
    XBCH: 'resource_rdx1t53mhl75r05r5x2cyty8l04fuh8nfukjkan3sswsvcrcj8v0d0yf6d',
    XETC: 'resource_rdx1t5qhyvgr5mh2nrwwntkk9q3nuy9e9rddgps68shalucr0cyx9fwrwv',
    XPOL: 'resource_rdx1tk0ma9ngnle2jka3j33d5d7072ywy033x0d6fkvc3x9sz6ts3nvxmz',
    ROBO: 'resource_rdx1thsg68perylkawv6w9vuf9ctrjl6pjhh2vrhp5v4q0vxul7a5ws8wz',
    HHUG: 'resource_rdx1tk3097l484387jxzp6dt6su4yruc3g4wacwpm68wk72a6h50z6kxzl',
    CTB: 'resource_rdx1thpjseu2zjy2cldlyxqckrj7nmgj6yhlaxvwa5s8m0fsu7ss9g7d27',
    UID: 'resource_rdx1t58wmrahzy043l5v3x93qng9z7djym4w0wpcq8fpfxk8lrkqwg6xa9',
    SIN: 'resource_rdx1t54u9u2da5gsaltwfr4vj9g207nqz8rsaj69dx60g9xv0p5ntwcrqe',
    EGG: 'resource_rdx1thegmx02xttf6ylvzltupd63qutrrmk9r4erxm5fpmgztgcgdc4c34',
    MOC: 'resource_rdx1thejtxz8g9tmy04gqq7kqxwrmwze2zg38qvndtyv3j88uetes890tl',
    XGRT: 'resource_rdx1t56xvxq96c02vxsmp0uzq7r4zk2wqam5mjjg98ytv7aadgwagj60p7',
    XIMX: 'resource_rdx1tk3rs0wmsja4sldml4tkj993s7669heulw57jva777h5eqmg6xf8mx',
    XENA: 'resource_rdx1t5d2qch32njedqpa204yswpxmxea5wazqf7tavptcxgq5j77suuxlr',
    YOMM: 'resource_rdx1t4lkvwqd7wxqcatatelre2svxy04fn6980ydzld0faqamv8nrxhzm5',
    MONKE:
      'resource_rdx1th604vhzf5kt4welzruzqgxzqrw653glewcyu98ck0sfqacl6q5uu7',
    BTC4: 'resource_rdx1t5wlc230xf0da3npdj2sp6vvrsvvm2hm5xp5hyzkdy9a04damy740g',
    EM: 'resource_rdx1t5ddr2kll2vlwaw70lsl2uhl0p2xs57a85zy53hhwpjkag5qgfka62',
    BRICS:
      'resource_rdx1tk6flk2ja09g92u0ssxce6jxcawepqcdmzqjeasnznl0utut0fj2mm',
    DT: 'resource_rdx1tkwry20l2xddpjkvk07xj6mq3n6g6fv3rtpm799ay6upwrfvefvypn',
    XJ: 'resource_rdx1t4l27zjw5hhejrsztcee4sltrrgm7hzw9xmz9sw486kmrmumfyxzp7',
    VP: 'resource_rdx1t5pz4sml58ruhqrmwfgeuxqcvjr05yan8wtkty7u8n2wq9r5h2pdfs',
    DART: 'resource_rdx1th3n99e8x9nduxr55hs4yq97wp96yvucpq5v2vchp0jkrd6ta2fytn',
    SEXXY:
      'resource_rdx1t4hka09gp6ptfa57wupze0u2dpdrrh0vs9w09mfq3xh2pp4zwvg46n',
    DLC: 'resource_rdx1tklmya87heqtx88sar0jajgnf3ksfkw3lk8msu39ggdsnt3thchygy',
    RADO: 'resource_rdx1thndn8z9dmc2jhxpxjegu7uv92ens695hvp8972akp8tyx25kreuse',
    HUGD: 'resource_rdx1t5mpgkgqzad8ddfpg58n5kk9lzmp8dfevnysmfhv60yryyxj0cu2aj',
    KYW: 'resource_rdx1tkccph69k52vhwlj7lgxaect2vs7txvrm88lws74685a4quu5ughg2',
    MARS: 'resource_rdx1t479t5et2zfl82p93khl5y30wuurj4xwtgnlqqjm2rhykg2jmt43uu',
    DAXTER:
      'resource_rdx1tklk9zrjqaqwmjq2qkf5due8wsn96zvffj2jr3tpgs7u00we4rds8u',
    WAXRD:
      'resource_rdx1t4ll4djjmfdas7h928wxvs63uxvvp8g8qjh5k9ua4g00qcg7vzvn58',
    FDS: 'resource_rdx1t5zdpmudks2u0maztsht54n4u7l005awrmu2xvrajz63x339jsrsz9',
    WAY: 'resource_rdx1t5sfhgevauqvyxggky5r3p4uf768fjawx5dkmyfjyzw5zuw2zneea6',
    SSS: 'resource_rdx1tk33qqrfz2m0p4t8mkpw9ahr3w3qngpwfrnhh7vq2kuqpdv90lkmcs',
    XBNB: 'resource_rdx1thcmmknq2mlhxzy20pd0kh4w2runhqhhax9tf99n50l9ylg8wf4sne',
    XSHIB:
      'resource_rdx1t55ja5ser4g8rkh2qm6jhr44zej9h6yd2z9n34e3wffrhnth6e5awe',
    XLINK:
      'resource_rdx1t58k9jlygcw27sx7peza34jtk65qhe8y7qxmyp9l09pz5sjgadkcq3',
    XWLD: 'resource_rdx1t5jlk3wlxrvml2a0aa59h8cjt59utuku8qt5mlt8s8590qt024km3y',
    COLIE:
      'resource_rdx1thh8uewrnc9ez4zwcdj3ty0rs6w5rmx5ddqfnqg0z3sscjmt439hje',
    WOLF: 'resource_rdx1thy62de5yspm7v3dsqjyc3t24h2j5kf2gcx7lmvnrv26h8dhhp0ryx',
    GROWW:
      'resource_rdx1t4kh5zjslqjfl5r4u28khsdrpuqgpqptdrjx7f0d24sncz6xnrqa3e',
    XADA: 'resource_rdx1t49ukgsdsfv0232vez5nr2z9a0cwd6vjrzsssgxt9zlqglr5kxwpr9',
    XMKR: 'resource_rdx1tkc8uhc3frpveynthwzh0675zlv9cxzd68dvs6lcu6x5hc0wxkdw34',
    XXLM: 'resource_rdx1thc7rlr7hc9xh57q4slysppznam3py9h5spjm0jfu7x7t578gd6duk',
    XTRX: 'resource_rdx1thkhj9gzgkd97m0fk79x0pd4y6qqhw60v6frh3nrhllxp83ma666jn',
  },
} as const;

// Centralized token mapping with native and wrapped asset classification
export const tokenNameMap = {
  xrdDerivativeAssets: {
    [Assets.Fungible.XRD]: 'xrd',
    [Assets.Fungible.LSULP]: 'lsulp',
    [Assets.Fungible.HLP]: 'hlp',
  },
  // Native Radix assets
  nativeAssets: {
    [Assets.Fungible.OCI]: 'oci',
    [Assets.Fungible.EARLY]: 'early',
    [Assets.Fungible.ILIS]: 'ilis',
    [Assets.Fungible.DFP2]: 'dfp2',
    [Assets.Fungible.ASTRL]: 'astrl',
    [Assets.Fungible.FLOOP]: 'floop',
    [Assets.Fungible.REDDICKS]: 'reddicks',
    [Assets.Fungible.WEFT]: 'weft',
    [Assets.Fungible.SCRYPTO]: 'scrypto',
    [Assets.Fungible.WOWO]: 'wowo',
    [Assets.Fungible.DELIVER]: 'deliver',
    [Assets.Fungible.HUG]: 'hug',
    [Assets.Fungible.DAN]: 'dan',
    [Assets.Fungible.BOSS]: 'boss',
    [Assets.Fungible.MOX]: 'mox',
    [Assets.Fungible.JWLXRD]: 'jwlxrd',
    [Assets.Fungible.CASSIE]: 'cassie',
    [Assets.Fungible.EDG]: 'edg',
    [Assets.Fungible.CVX]: 'cvx',
    [Assets.Fungible.GREAT]: 'great',
    [Assets.Fungible.FOTON]: 'foton',
    [Assets.Fungible.IST]: 'ist',
    [Assets.Fungible.SMK]: 'smk',
    [Assets.Fungible.WRP]: 'wrp',
    [Assets.Fungible.DELAY]: 'delay',
    [Assets.Fungible.PHNX]: 'phnx',
    [Assets.Fungible.IDA]: 'ida',
    [Assets.Fungible.HIT]: 'hit',
    [Assets.Fungible.BOB]: 'bob',
    [Assets.Fungible.DUCKK]: 'duckk',
    [Assets.Fungible.UNIT]: 'unit',
    [Assets.Fungible.CAVIAR]: 'caviar',
    [Assets.Fungible.RWT]: 'rwt',
    [Assets.Fungible.CHUG]: 'chug',
    [Assets.Fungible.LOCK]: 'lock',
    [Assets.Fungible.RWA]: 'rwa',
    [Assets.Fungible.GIFT]: 'gift',
    [Assets.Fungible.RBX]: 'rbx',
    [Assets.Fungible.DINO]: 'dino',
    [Assets.Fungible.CRUMB]: 'crumb',
    [Assets.Fungible.KGLD]: 'kgld',
    [Assets.Fungible.ASTRA]: 'astra',
    [Assets.Fungible.DGC]: 'dgc',
    [Assets.Fungible.FOMO]: 'fomo',
    [Assets.Fungible.MXRD]: 'mxrd',
    [Assets.Fungible.FUSD]: 'fusd',
    [Assets.Fungible.RR]: 'rr',
    [Assets.Fungible.HO]: 'ho',
    [Assets.Fungible.SPED]: 'sped',
    [Assets.Fungible.GOD]: 'god',
    [Assets.Fungible.MNI]: 'mni',
    [Assets.Fungible.DPH]: 'dph',
    [Assets.Fungible.SOAP]: 'soap',
    [Assets.Fungible.GNO]: 'gno',
    [Assets.Fungible.SPACE]: 'space',
    [Assets.Fungible.HYPE]: 'hype',
    [Assets.Fungible.RAM]: 'ram',
    [Assets.Fungible.SRG]: 'srg',
    [Assets.Fungible.DDAN]: 'ddan',
    [Assets.Fungible.SLFI]: 'slfi',
    [Assets.Fungible.PPCAT]: 'ppcat',
    [Assets.Fungible.GNRD]: 'gnrd',
    [Assets.Fungible.FADE]: 'fade',
    [Assets.Fungible.STILLHERE]: 'stillhere',
    [Assets.Fungible.CABAL]: 'cabal',
    [Assets.Fungible.RUGI]: 'rugi',
    [Assets.Fungible.FLUFF]: 'fluff',
    [Assets.Fungible.RADIT]: 'radit',
    [Assets.Fungible.MRD]: 'mrd',
    [Assets.Fungible.EDWED]: 'edwed',
    [Assets.Fungible.REAPER]: 'reaper',
    [Assets.Fungible.RDL]: 'rdl',
    [Assets.Fungible.DOGE]: 'doge',
    [Assets.Fungible.BOBBY]: 'bobby',
    [Assets.Fungible.SINX]: 'sinx',
    [Assets.Fungible.HNY]: 'hny',
    [Assets.Fungible.DOUBT]: 'doubt',
    [Assets.Fungible.ICE]: 'ice',
    [Assets.Fungible.KISS]: 'kiss',
    [Assets.Fungible.BURN]: 'burn',
    [Assets.Fungible.ZOOMIES]: 'zoomies',
    [Assets.Fungible.ERM]: 'erm',
    [Assets.Fungible.JIT]: 'jit',
    [Assets.Fungible.GAB]: 'gab',
    [Assets.Fungible.EMOON]: 'emoon',
    [Assets.Fungible.WAVE]: 'wave',
    [Assets.Fungible.PEP]: 'pep',
    [Assets.Fungible.XSE]: 'xse',
    [Assets.Fungible.CTO]: 'cto',
    [Assets.Fungible.GARY]: 'gary',
    [Assets.Fungible.XING]: 'xing',
    [Assets.Fungible.THC]: 'thc',
    [Assets.Fungible.RBOY]: 'rboy',
    [Assets.Fungible.DGULDEN]: 'dgulden',
    [Assets.Fungible.WBTC]: 'wbtc',
    [Assets.Fungible.DEVIL]: 'devil',
    [Assets.Fungible.FFS]: 'ffs',
    [Assets.Fungible.PLANET]: 'planet',
    [Assets.Fungible.CXRD]: 'cxrd',
    [Assets.Fungible.DUMB]: 'dumb',
    [Assets.Fungible.STAB]: 'stab',
    [Assets.Fungible.RAI]: 'rai',
    [Assets.Fungible.WEN]: 'wen',
    [Assets.Fungible.SHARD]: 'shard',
    [Assets.Fungible.WIF]: 'wif',
    [Assets.Fungible.COCO]: 'coco',
    [Assets.Fungible.SHEP]: 'shep',
    [Assets.Fungible.RDK]: 'rdk',
    [Assets.Fungible.LUCK]: 'luck',
    [Assets.Fungible.JTM]: 'jtm',
    [Assets.Fungible.DEXTR]: 'dextr',
    [Assets.Fungible.CERB]: 'cerb',
    [Assets.Fungible.BALLS]: 'balls',
    [Assets.Fungible.STUFT]: 'stuft',
    [Assets.Fungible.DNT]: 'dnt',
    [Assets.Fungible.NEARLY]: 'nearly',
    [Assets.Fungible.POPEY]: 'popey',
    [Assets.Fungible.RDS]: 'rds',
    [Assets.Fungible.MEH]: 'meh',
    [Assets.Fungible.SHRK]: 'shrk',
    [Assets.Fungible.PAPER]: 'paper',
    [Assets.Fungible.PENNY]: 'penny',
    [Assets.Fungible.TRUMP]: 'trump',
    [Assets.Fungible.HODL]: 'hodl',
    [Assets.Fungible.RON2DLT]: 'ron2dlt',
    [Assets.Fungible.PUMP]: 'pump',
    [Assets.Fungible.PEPE]: 'pepe',
    [Assets.Fungible.VKC]: 'vkc',
    [Assets.Fungible.DONT]: 'dont',
    [Assets.Fungible.SLACK]: 'slack',
    [Assets.Fungible.ELON]: 'elon',
    [Assets.Fungible.SIMPSONS]: 'simpsons',
    [Assets.Fungible.HMM]: 'hmm',
    [Assets.Fungible.GUNA]: 'guna',
    [Assets.Fungible.STEEL]: 'steel',
    [Assets.Fungible.PRICE]: 'price',
    [Assets.Fungible.CATZ]: 'catz',
    [Assets.Fungible.NOW]: 'now',
    [Assets.Fungible.SCORP]: 'scorp',
    [Assets.Fungible.LAMBONAUT]: 'lambonaut',
    [Assets.Fungible.PZZA]: 'pzza',
    [Assets.Fungible.CHILL]: 'chill',
    [Assets.Fungible.SHINE]: 'shine',
    [Assets.Fungible.RGPF]: 'rgpf',
    [Assets.Fungible.TENGE]: 'tenge',
    [Assets.Fungible.BRO]: 'bro',
    [Assets.Fungible.FLIPP]: 'flipp',
    [Assets.Fungible.MGC]: 'mgc',
    [Assets.Fungible.RST]: 'rst',
    [Assets.Fungible.FUD]: 'fud',
    [Assets.Fungible.TWERK]: 'twerk',
    [Assets.Fungible.RZR]: 'rzr',
    [Assets.Fungible.LOL]: 'lol',
    [Assets.Fungible.HRB]: 'hrb',
    [Assets.Fungible.CMON]: 'cmon',
    [Assets.Fungible.CODE]: 'code',
    [Assets.Fungible.GUH]: 'guh',
    [Assets.Fungible.FISHX]: 'fishx',
    [Assets.Fungible.RAPEX]: 'rapex',
    [Assets.Fungible.EASY]: 'easy',
    [Assets.Fungible.SECURE]: 'secure',
    [Assets.Fungible.HEADLINE]: 'headline',
    [Assets.Fungible.NEONSHIP]: 'neonship',
    [Assets.Fungible.NATTYBABY]: 'nattybaby',
    [Assets.Fungible.PANTIX]: 'pantix',
    [Assets.Fungible.SMILE]: 'smile',
    [Assets.Fungible.TAY]: 'tay',
    [Assets.Fungible.MEMAI]: 'memai',
    [Assets.Fungible.HOT]: 'hot',
    [Assets.Fungible.GOLD]: 'gold',
    [Assets.Fungible.REM]: 'rem',
    [Assets.Fungible.POO]: 'poo',
    [Assets.Fungible.PHSP]: 'phsp',
    [Assets.Fungible.PAT]: 'pat',
    [Assets.Fungible.BOX]: 'box',
    [Assets.Fungible.LOU]: 'lou',
    [Assets.Fungible.KWIFT]: 'kwift',
    [Assets.Fungible.DEEZ]: 'deez',
    [Assets.Fungible.ALEX]: 'alex',
    [Assets.Fungible.AGCT]: 'agct',
    [Assets.Fungible.PNUT]: 'pnut',
    [Assets.Fungible.IM]: 'im',
    [Assets.Fungible.RANTS]: 'rants',
    [Assets.Fungible.RADIXFIESTA]: 'radixfiesta',
    [Assets.Fungible.NRLY]: 'nrly',
    [Assets.Fungible.WTS]: 'wts',
    [Assets.Fungible.WHY]: 'why',
    [Assets.Fungible.GLESS]: 'gless',
    [Assets.Fungible.ADT]: 'adt',
    [Assets.Fungible.KURD]: 'kurd',
    [Assets.Fungible.SASTRL]: 'sastrl',
    [Assets.Fungible.ELT]: 'elt',
    [Assets.Fungible.SCAM]: 'scam',
    [Assets.Fungible.NOTETH]: 'noteth',
    [Assets.Fungible.NOTXRD]: 'notxrd',
    [Assets.Fungible.NOTUSDC]: 'notusdc',
    [Assets.Fungible.NOTUSDT]: 'notusdt',
    [Assets.Fungible.MRK]: 'mrk',
    [Assets.Fungible.SWT]: 'swt',
    [Assets.Fungible.SLG]: 'slg',
    [Assets.Fungible.FIRE]: 'fire',
    [Assets.Fungible.PANDA]: 'panda',
    [Assets.Fungible.NOTBTC]: 'notbtc',
    [Assets.Fungible.FARM]: 'farm',
    [Assets.Fungible.SIM]: 'sim',
    [Assets.Fungible.MNC]: 'mnc',
    [Assets.Fungible.BLSS]: 'blss',
    [Assets.Fungible.ZRCK]: 'zrck',
    [Assets.Fungible.NAKA]: 'naka',
    [Assets.Fungible.LONG]: 'long',
    [Assets.Fungible.ACR]: 'acr',
    [Assets.Fungible.CREW]: 'crew',
    [Assets.Fungible.RDV]: 'rdv',
    [Assets.Fungible.XPEPE]: 'xpepe',
    [Assets.Fungible.XXRP]: 'xxrp',
    [Assets.Fungible.BANANA]: 'banana',
    [Assets.Fungible.XCRO]: 'xcro',
    [Assets.Fungible.XAAVE]: 'xaave',
    [Assets.Fungible.XUNI]: 'xuni',
    [Assets.Fungible.XDAI]: 'xdai',
    [Assets.Fungible.COS]: 'cos',
    [Assets.Fungible.XBCH]: 'xbch',
    [Assets.Fungible.XETC]: 'xetc',
    [Assets.Fungible.XPOL]: 'xpol',
    [Assets.Fungible.ROBO]: 'robo',
    [Assets.Fungible.HHUG]: 'hhug',
    [Assets.Fungible.CTB]: 'ctb',
    [Assets.Fungible.UID]: 'uid',
    [Assets.Fungible.SIN]: 'sin',
    [Assets.Fungible.EGG]: 'egg',
    [Assets.Fungible.MOC]: 'moc',
    [Assets.Fungible.XGRT]: 'xgrt',
    [Assets.Fungible.XIMX]: 'ximx',
    [Assets.Fungible.XENA]: 'xena',
    [Assets.Fungible.YOMM]: 'yomm',
    [Assets.Fungible.MONKE]: 'monke',
    [Assets.Fungible.BTC4]: 'btc4',
    [Assets.Fungible.EM]: 'em',
    [Assets.Fungible.BRICS]: 'brics',
    [Assets.Fungible.DT]: 'dt',
    [Assets.Fungible.XJ]: 'xj',
    [Assets.Fungible.VP]: 'vp',
    [Assets.Fungible.DART]: 'dart',
    [Assets.Fungible.SEXXY]: 'sexxy',
    [Assets.Fungible.DLC]: 'dlc',
    [Assets.Fungible.RADO]: 'rado',
    [Assets.Fungible.HUGD]: 'hugd',
    [Assets.Fungible.KYW]: 'kyw',
    [Assets.Fungible.MARS]: 'mars',
    [Assets.Fungible.DAXTER]: 'daxter',
    [Assets.Fungible.WAXRD]: 'waxrd',
    [Assets.Fungible.FDS]: 'fds',
    [Assets.Fungible.WAY]: 'way',
    [Assets.Fungible.SSS]: 'sss',
    [Assets.Fungible.XBNB]: 'xbnb',
    [Assets.Fungible.XSHIB]: 'xshib',
    [Assets.Fungible.XLINK]: 'xlink',
    [Assets.Fungible.XWLD]: 'xwld',
    [Assets.Fungible.COLIE]: 'colie',
    [Assets.Fungible.WOLF]: 'wolf',
    [Assets.Fungible.GROWW]: 'groww',
    [Assets.Fungible.XADA]: 'xada',
    [Assets.Fungible.XMKR]: 'xmkr',
    [Assets.Fungible.XXLM]: 'xxlm',
    [Assets.Fungible.XTRX]: 'xtrx',
  },
  // Wrapped/bridged assets
  bluechipAssets: {
    [Assets.Fungible.wxBTC]: 'xwbtc',
    [Assets.Fungible.xETH]: 'xeth',
    [Assets.Fungible.hwBTC]: 'hwbtc',
    [Assets.Fungible.hETH]: 'heth',
  },
  stableAssets: {
    [Assets.Fungible.xUSDC]: 'xusdc',
    [Assets.Fungible.xUSDT]: 'xusdt',
    [Assets.Fungible.sUSD]: 'susd',
    [Assets.Fungible.hUSDC]: 'husdc',
    [Assets.Fungible.hUSDT]: 'husdt',
  },
} as const;

export const flatTokenNameMap = {
  ...tokenNameMap.nativeAssets,
  ...tokenNameMap.bluechipAssets,
  ...tokenNameMap.stableAssets,
  ...tokenNameMap.xrdDerivativeAssets,
} as const;

export const resourceAddresses = Object.keys(
  flatTokenNameMap,
) as readonly (keyof typeof flatTokenNameMap)[];

export const AssetType = {
  XRD_DERIVATIVE: 'der',
  NATIVE: 'nat',
  BLUECHIP: 'blu',
  STABLE: 'sta',
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

// A set of assets for quick lookup
export const nativeAssets = new Set(Object.keys(tokenNameMap.nativeAssets));
export const xrdDerivativeAssets = new Set(
  Object.keys(tokenNameMap.xrdDerivativeAssets),
);
export const bluechipAssets = new Set(Object.keys(tokenNameMap.bluechipAssets));
export const stableAssets = new Set(Object.keys(tokenNameMap.stableAssets));

export const getAssetByResourceAddress = (resourceAddress: string) => {
  if (nativeAssets.has(resourceAddress)) {
    return {
      resourceAddress,
      assetType: AssetType.NATIVE,
      symbol:
        tokenNameMap.nativeAssets[
          resourceAddress as keyof typeof tokenNameMap.nativeAssets
        ],
    };
  } else if (xrdDerivativeAssets.has(resourceAddress)) {
    return {
      resourceAddress,
      assetType: AssetType.XRD_DERIVATIVE,
      symbol:
        tokenNameMap.xrdDerivativeAssets[
          resourceAddress as keyof typeof tokenNameMap.xrdDerivativeAssets
        ],
    };
  } else if (bluechipAssets.has(resourceAddress)) {
    return {
      resourceAddress,
      assetType: AssetType.BLUECHIP,
      symbol:
        tokenNameMap.bluechipAssets[
          resourceAddress as keyof typeof tokenNameMap.bluechipAssets
        ],
    };
  } else if (stableAssets.has(resourceAddress)) {
    return {
      resourceAddress,
      assetType: AssetType.STABLE,
      symbol:
        tokenNameMap.stableAssets[
          resourceAddress as keyof typeof tokenNameMap.stableAssets
        ],
    };
  }
};

export type TokenInfo = {
  name: string;
  isNativeAsset: boolean;
};
