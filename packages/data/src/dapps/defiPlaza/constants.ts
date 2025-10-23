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
  },
  hsolPool: {
    type: 'component',
    baseResourceAddress: Assets.Fungible.hSOL,
    basePoolAddress:
      'pool_rdx1c4lrpucdyfhe52znmp3qe8jnjmnt25u6s4hhtz9k88ngju0urj5yy4',
    baseLpResourceAddress:
      'resource_rdx1tkuxyrqa6lzpsmh75v9af55v4q5gu35wxx0wh30lz6uqd265u0hgvq',
    quoteResourceAddress: Assets.Fungible.XRD,
    quotePoolAddress:
      'pool_rdx1c43fvtx682u76wz6agel9374sa93kzndkjvz7lh4mdqm8x649krvnq',
    quoteLpResourceAddress:
      'resource_rdx1th7zlzjs0elh2pgr3ce4g8k4g4w2l2sfq27se78dghaqhcx6xq3c5w',
    componentAddress:
      'component_rdx1cp8qxqeaqxud6fu6rvv7vm0ngm8rlswdps2tp8jqhvgw3f2734ccyu',
  },
  hbnbxrdPool: {
    type: 'component',
    baseResourceAddress: Assets.Fungible.hBNB,
    quoteResourceAddress: Assets.Fungible.XRD,
    componentAddress:
      'component_rdx1crpc6jekv3nhfhxvzrp5zm44a5xcsg2n524gcxrxetax2cp9sh30gt',
    basePoolAddress:
      'pool_rdx1ch0aecz95kl9vdvyz6q3zh4p6vcshefwakx3jfs3uk34y8sv8d8uvy',
    baseLpResourceAddress:
      'resource_rdx1t4d5n87gsq5vg0xlszyvmd8pgxv5a9nyrj7u9frgxcsy2gtgqk2d3h',
    quotePoolAddress:
      'pool_rdx1c42dp3amx7el85vv588vxkqjn53rd8np30qyrpf5pk95uaalu057d4',
    quoteLpResourceAddress:
      'resource_rdx1thhctpg6ctkr7pf4axk0p3ysuyu7574essvj8r8m2d7tf4709x9e6z',
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
