import { layer } from '@effect/vitest';

import { Effect, Logger } from 'effect';
import { HyperStakeComponent } from './caviarnine/hyperStake';
import { QuantaSwapComponent } from './caviarnine/quantaSwap';
import { WeightedPoolComponent } from './caviarnine/weightedPool';
import { ComponentRepo } from './componentRepo';
import { PlazaPairSchema } from './defiplaza/plazaPair';
import { BasicPoolComponent } from './ociswap/basicPool';
import { FlexPoolComponent } from './ociswap/flexPool';
import { PrecisionPoolComponent } from './ociswap/precisionPool';
import { LendingMarketComponent as RootFinanceLendingMarketComponent } from './rootFinance/lendingMarket';
import { MarginPoolComponent } from './surge/marginPool';
import { LendingMarketComponent as WeftFinanceLendingMarketComponent } from './weftFinance/lendingMarket';

export const componentAddresses = [
  'component_rdx1cp9w8443uyz2jtlaxnkcq84q5a5ndqpg05wgckzrnd3lgggpa080ed',
  'component_rdx1cpat0a7p2ufty0lrawwtxfr3xm2qf5ys2xe6mlux4s074utzkz0w0y',
  'component_rdx1cpc6hjytxcvddl3e38u9amkn52ly3vzw6r0pxu54ge43l4ttw9ym7c',
  'component_rdx1cpdmqk0ujmyttnnh82lc05a578xgll6tgdadwt4crlnc4usfk75yn2',
  'component_rdx1cpgf3nkgq4ry569rtn3pl6ytymuwh3d23w3vvawxfcnhhzm77e8jys',
  'component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr',
  'component_rdx1cph6ayqwqgnavd5yjxjx966nfcnxwt85k9p8fqv37r5pfnn3qcm6az',
  'component_rdx1cppd8rq7gfwad75z56mz9tldqmw4aps48hqnx2stf4eeew8v6tyd72',
  'component_rdx1cpr3gvk0r3nauc24kt0y0w5cpvjcxe54z07nu26z83qk2tgeangmdl',
  'component_rdx1cprwh9r3wx6vvt0gnv8wscwljegzcevp0hzuju2873eza7fgg493fw',
  'component_rdx1cpsvw207842gafeyvf6tc0gdnq47u3mn74kvzszqlhc03lrns52v82',
  'component_rdx1cpwwhuxpe2npedx0axkj4nae8uv5222r0syjtu5fxuaxaj78rf30v9',
  'component_rdx1cpy6putj5p7937clqgcgutza7k53zpha039n9u5hkk0ahh4stdmq4w',
  'component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf',
  'component_rdx1cq0m4e6gjyekk87lxugtgw6a5cnm7fa60vqn6rpe02hjhfh7tus2x6',
  'component_rdx1cq77k5vwv90fp6fllkp650zhs92vvy6pvcdvm3cwvnha2zz62rg7l9',
  'component_rdx1cq8nefdv75yqkgwqe9rhj436yr3z09du7g797y90prmwf9ugv0m8u2',
  'component_rdx1cqaknlm9rfjxvzwhp7mzsjzustqpuqn6yhsmh8fn3zyr8sm5p3j7ny',
  'component_rdx1cqelumvmmgwths34k9pp0htd2ykwq7d70m0r389etwh39ul3j5tyj5',
  'component_rdx1cqly8sxtv7xfe8td9uxvyhw585szj2a5p220dn28ru5d2phcwdcgg5',
  'component_rdx1cqr24rye05h28qnn5crjwlq0djvfcmaegg8sgdkwywfx6s97nk9fcy',
  'component_rdx1cqs338cyje65rk44zgmjvvy42qcszrhk9ewznedtkqd8l3crtgnmh5',
  'component_rdx1cqs6t5t70fcgrva6ws6gs84u29w3kecn6j0zkjg0u0x9szx0xnusxj',
  'component_rdx1cqvxkaazmpnvg3f9ufc5n2msv6x7ztjdusdm06lhtf5n7wr8guggg5',
  'component_rdx1cqy8gd5wk8cq7c4g4gpa2lgulk7tcqj673fgz90cu7fa6x2f9gshaz',
  'component_rdx1cr0nw5ppvryyqcv6thkslcltkw5cm3c2lvm2yr8jhh9rqe76stmars',
  'component_rdx1cr4w4kezazrxwzy2yyndep2nc55j4plhpg8d4z57cd4u75rpqwfeg2',
  'component_rdx1cr6lxkr83gzhmyg4uxg49wkug5s4wwc3c7cgmhxuczxraa09a97wcu',
  'component_rdx1cr7xqqyn2anx5l85curcqy8z3rv9aprqf0axh9dkmsdfk9zfffer8m',
  'component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd',
  'component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm',
  'component_rdx1crd7xk0nu07kj60artzz6evws7r6w69lwarf0nqmkxuwwluy5xjud0',
  'component_rdx1crdhl7gel57erzgpdz3l3vr64scslq4z7vd0xgna6vh5fq5fnn9xas',
  'component_rdx1crezrpxw9ypg6v2panqjqwevnwplg94yeej0rhqq9k7p4kgnltrc9g',
  'component_rdx1crhrzxe6x35hwx3wmnnw0g8qs84p2hle6ud7n2q4ffzp0udluqm8hj',
  'component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp',
  'component_rdx1crmvyl8nghu4g9ssxjq3yns793mqpn7nkc2cx5rmd2rzkaw0x755cu',
  'component_rdx1crpq83nf76ea2dkkjxfwr426qvmpu9pyakh58ay3eyswe4ps5yn3q2',
  'component_rdx1crumqsy0nu4pl3fwah3nkf8eg8qhltxenk83wh9tzlmr5jnsqs3x4c',
  'component_rdx1crvsxzkyh0609z4jj7vjzwrnede37676al287rumvy5p32wpvtr59e',
  'component_rdx1crvtvnr02f5fl49jvap4rndlepfsgta455wcyteacr7dtfgzvqqw6n',
  'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
  'component_rdx1crz9nv7mvp3lamx3kl4xq8lgwyalvn7rgmlzse2rfs4r9u5sdq0vzh',
  'component_rdx1cz2p7z6dfnns6ctcacns96rnxmaxuhlxwns6cyd8avd8jnemnj9kvf',
  'component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g',
  'component_rdx1cz7s2xn8ddpmgm3uw0ma4jhaxhxdwce253v9j5agvffhftny6rgh8n',
  'component_rdx1cz89w3ecvh9jvdd892vycs44rr042lteg75zgdydq9csn5d87snvdw',
  'component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f',
  'component_rdx1cz8p5lc8vmj96hdguy02hkfq4z5xyxf9k759dj8ym8exj8x8zgmw9p',
  'component_rdx1cz9akawaf6d2qefds33c5py9w3fjpgp2qnaddtlcxm06m060wl2j68',
  'component_rdx1czfuwcgnn7dxjjmz9zcacr347ahkuguz7vr9mcdkmywldg0f7qlylp',
  'component_rdx1czgaazn4wqf40kav57t8tu6kwv2a5sfmnlzlar9ee6kdqk0ll2chsz',
  'component_rdx1czmc0yzur2tefmx9mjdxdudc49vv7h2zh5xcg3sy47ja3v3d7wppsh',
  'component_rdx1czmha58h7vw0e4qpxz8ga68cq6h5fjm27w2z43r0n6k9x65nvrjp4g',
  'component_rdx1czy2naejcqx8gv46zdsex2syuxrs4jnqzug58e66zr8wglxzvu97qr',
  'component_rdx1czzqr5m40x3sklwntcmx8uw3ld5nj7marq66nm6erp3prw7rv8zu29',
];

const testCases = [
  {
    address:
      'component_rdx1cp9w8443uyz2jtlaxnkcq84q5a5ndqpg05wgckzrnd3lgggpa080ed',
    componentDefinition: QuantaSwapComponent,
    component: {
      componentAddress:
        'component_rdx1cp9w8443uyz2jtlaxnkcq84q5a5ndqpg05wgckzrnd3lgggpa080ed',
      blueprintName: 'QuantaSwap',
      dappId: 'c9',
      packageAddress:
        'package_rdx1p4r9rkp0cq67wmlve544zgy0l45mswn6h798qdqm47x4762h383wa3',
      data: {
        token_x: {
          resourceAddress:
            'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
          assetType: 'blu',
          symbol: 'xwbtc',
        },
        token_y: {
          resourceAddress:
            'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
          assetType: 'der',
          symbol: 'xrd',
        },
        liquidity_receipt:
          'resource_rdx1nfdteayvxl6425jc5x5xa0p440h6r2mr48mgtj58szujr5cvgnfmn9',
      },
    },
  },
  {
    address:
      'component_rdx1cpc6hjytxcvddl3e38u9amkn52ly3vzw6r0pxu54ge43l4ttw9ym7c',
    componentDefinition: WeightedPoolComponent,
    component: {
      blueprintName: 'WeightedPool',
      componentAddress:
        'component_rdx1cpc6hjytxcvddl3e38u9amkn52ly3vzw6r0pxu54ge43l4ttw9ym7c',
      dappId: 'c9',
      data: {
        pool_component:
          'pool_rdx1ch3vyhagpzqll4cu6quafdpkf7lvyuz7ke4z66tuqpxhvtxzd9lvmu',
        resource_x: {
          assetType: 'nat',
          resourceAddress:
            'resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9',
          symbol: 'floop',
        },
        resource_y: {
          assetType: 'der',
          resourceAddress:
            'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
          symbol: 'xrd',
        },
      },
      packageAddress:
        'package_rdx1pkhxu8zy5t7h3rww6jsftca22e2jdgqpc28rje7lnmkjxxf50zagr7',
    },
  },
  {
    address:
      'component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr',
    componentDefinition: PrecisionPoolComponent,
    component: {
      blueprintName: 'PrecisionPool',
      componentAddress:
        'component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr',
      dappId: 'oc',
      data: {
        lpAddress:
          'resource_rdx1n2zsvvdahtnlm53ms5f6zazjx6rnnmu2u6xjdr8ggzw45way0tefe6',
        poolAddress:
          'component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr',
        xToken: {
          assetType: 'blu',
          resourceAddress:
            'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
          symbol: 'xwbtc',
        },
        yToken: {
          assetType: 'der',
          resourceAddress:
            'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
          symbol: 'xrd',
        },
      },
      packageAddress:
        'package_rdx1pkrgvskdkglfd2ar4jkpw5r2tsptk85gap4hzr9h3qxw6ca40ts8dt',
    },
  },
  {
    address:
      'component_rdx1cppd8rq7gfwad75z56mz9tldqmw4aps48hqnx2stf4eeew8v6tyd72',
    componentDefinition: PlazaPairSchema,
    component: {
      blueprintName: 'PlazaPair',
      componentAddress:
        'component_rdx1cppd8rq7gfwad75z56mz9tldqmw4aps48hqnx2stf4eeew8v6tyd72',
      dappId: 'dp',
      data: {
        base_address: {
          assetType: 'der',
          resourceAddress:
            'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
          symbol: 'xrd',
        },
        base_pool:
          'pool_rdx1chxn0nqj840r78t2ah5agchq4ue9p65q23nc9ckqfe0mmjstq8fyg0',
        base_pool_unit:
          'resource_rdx1tknxlx2sy23qkg6twvnu3kqcd5l4daacq0n6mdam54upqgx50f4ju8',
        quote_address: {
          assetType: 'nat',
          resourceAddress:
            'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
          symbol: 'dfp2',
        },
        quote_pool:
          'pool_rdx1c4547fnprjhlp2m27aycmf8rzrkrfzcck58jt2706r85gpcaeapz7k',
        quote_pool_unit:
          'resource_rdx1t4a5clnxmnctmezaty08cuugfzmj2lezqcjk2szezrfdfl4w4ederu',
      },
      packageAddress:
        'package_rdx1p4lnurhaffzjeg3gu0k27g06ngkvxvyuksczmk9k6gqvztfpks8r7l',
    },
  },
  {
    address:
      'component_rdx1cpy6putj5p7937clqgcgutza7k53zpha039n9u5hkk0ahh4stdmq4w',
    componentDefinition: WeftFinanceLendingMarketComponent,
    component: {
      blueprintName: 'LendingMarket',
      componentAddress:
        'component_rdx1cpy6putj5p7937clqgcgutza7k53zpha039n9u5hkk0ahh4stdmq4w',
      dappId: 'we',
      data: {
        cdp: 'resource_rdx1nt22yfvhuuhxww7jnnml5ec3yt5pkxh0qlghm6f0hz46z2wfk80s9r',
        lending_pool:
          'component_rdx1czmr02yl4da709ceftnm9dnmag7rthu0tu78wmtsn5us9j02d9d0xn',
      },
      packageAddress:
        'package_rdx1pktdrmwan4mcugates06wwcvspn4y0hsapm9zkyg4clh0sf8qn7c6t',
    },
  },
  {
    address:
      'component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf',
    componentDefinition: HyperStakeComponent,
    component: {
      blueprintName: 'HyperStake',
      componentAddress:
        'component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf',
      dappId: 'c9',
      data: {
        lp_resource:
          'resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m',
        pool_component:
          'pool_rdx1chmckjpr0ks5lk6h7mqvmrw56wt4w6tsuy6n2jhd8fhr8vc5en5e90',
        resource_x: {
          assetType: 'der',
          resourceAddress:
            'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
          symbol: 'lsulp',
        },
        resource_y: {
          assetType: 'der',
          resourceAddress:
            'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
          symbol: 'xrd',
        },
      },
      packageAddress:
        'package_rdx1pk7qn3gm9g7s6ss93xgvmytua5awt7ujqkpmcse93zn4dvfel7s8rh',
    },
  },
  {
    address:
      'component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd',
    componentDefinition: FlexPoolComponent,
    component: {
      blueprintName: 'FlexPool',
      componentAddress:
        'component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd',
      dappId: 'oc',
      data: {
        liquidity_pool:
          'pool_rdx1c5cyh7lhxly2mxzsmrs4c99vhxt9jzap3gaf7s8h0h68fqlpfht0un',
        lp_address:
          'resource_rdx1t4qxj7nnm0sra6f6j9jq73erd489hdad6jp92hggtfwgwy9p2mgn76',
        pool_address:
          'component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd',
        x_address: {
          assetType: 'nat',
          resourceAddress:
            'resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2',
          symbol: 'ilis',
        },
        y_address: {
          assetType: 'der',
          resourceAddress:
            'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
          symbol: 'xrd',
        },
      },
      packageAddress:
        'package_rdx1pkzxm6nw55wvz0e2fn79hd8t07834cxa8kpdlhq8s5lp5ldqpcglwe',
    },
  },
  {
    address:
      'component_rdx1crezrpxw9ypg6v2panqjqwevnwplg94yeej0rhqq9k7p4kgnltrc9g',
    componentDefinition: MarginPoolComponent,
    component: {
      blueprintName: 'MarginPool',
      componentAddress:
        'component_rdx1crezrpxw9ypg6v2panqjqwevnwplg94yeej0rhqq9k7p4kgnltrc9g',
      dappId: 'su',
      packageAddress:
        'package_rdx1p5qkwzc006ex4dph7ayuqhfdkp0aq7ljl97e96yzzyynmc86z9phf4',
    },
  },
  {
    address:
      'component_rdx1crvtvnr02f5fl49jvap4rndlepfsgta455wcyteacr7dtfgzvqqw6n',
    componentDefinition: BasicPoolComponent,
    component: {
      blueprintName: 'BasicPool',
      componentAddress:
        'component_rdx1crvtvnr02f5fl49jvap4rndlepfsgta455wcyteacr7dtfgzvqqw6n',
      dappId: 'oc',
      data: {
        liquidity_pool:
          'pool_rdx1ck5w5vnm6qwrmcp4way3wtyjztk7armjea3xc5xaktlk9r4gq6s3ee',
        lp_address:
          'resource_rdx1th5slwxk8x8xs7438ek6kp7kvrz5lxuu823tql4dqvd92q2fzxr3aq',
        x_address: {
          assetType: 'nat',
          resourceAddress:
            'resource_rdx1tk3fxrz75ghllrqhyq8e574rkf4lsq2x5a0vegxwlh3defv225cth3',
          symbol: 'weft',
        },
        y_address: {
          assetType: 'der',
          resourceAddress:
            'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
          symbol: 'xrd',
        },
      },
      packageAddress:
        'package_rdx1p5l6dp3slnh9ycd7gk700czwlck9tujn0zpdnd0efw09n2zdnn0lzx',
    },
  },
  {
    address:
      'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
    componentDefinition: RootFinanceLendingMarketComponent,
    component: {
      blueprintName: 'LendingMarket',
      componentAddress:
        'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
      dappId: 'ro',
      packageAddress:
        'package_rdx1phwak2lr7nczzl6rxzvtnjwszmvxqycp9h8pckcmy6uwdcucnjeu0p',
    },
  },
];

layer(ComponentRepo.Default)('aggregateAccountBalance', (it) => {
  it.effect('should getByComponentAddresses', () =>
    Effect.gen(function* () {
      const componentRepo = yield* ComponentRepo;

      yield* componentRepo.getByComponentAddresses(componentAddresses);
    }).pipe(Effect.provide(Logger.pretty)),
  );

  it.effect('should verify component data', () =>
    Effect.gen(function* () {
      const componentRepo = yield* ComponentRepo;

      yield* Effect.forEach(
        testCases,
        Effect.fnUntraced(function* (testCase) {
          const [result] = yield* componentRepo.getByComponentAddresses([
            testCase.address,
          ]);

          const actualComponent = JSON.parse(JSON.stringify(result ?? {}));
          const expectedComponent = testCase.component;

          if (expectedComponent.data)
            expect(actualComponent).toHaveProperty(
              'data',
              expectedComponent.data,
            );
          expect(actualComponent).toHaveProperty(
            'packageAddress',
            expectedComponent.packageAddress,
          );
          expect(actualComponent).toHaveProperty(
            'dappId',
            expectedComponent.dappId,
          );
          expect(actualComponent).toHaveProperty(
            'blueprintName',
            expectedComponent.blueprintName,
          );
          expect(actualComponent).toHaveProperty(
            'componentAddress',
            expectedComponent.componentAddress,
          );
        }),
      );
    }).pipe(Effect.provide(Logger.pretty)),
  );
});
