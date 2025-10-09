import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { GetEntityDetailsService } from '../../gateway/getEntityDetails';

import { GetFungibleBalanceService } from '../../gateway/getFungibleBalance';
import { GetResourcePoolUnitsService } from '../../resource-pool/getResourcePoolUnits';
import { deserializeBigNumber } from '../../utils/deserializeBigNumber';
import { fungibleBalance } from './fixtures/fungibleBalance';
import { pools } from './fixtures/pools';
import { GetDefiPlazaPositionsService } from './getDefiPlazaPositions';

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getDefiPlazaPositionsLive =
  GetDefiPlazaPositionsService.DefaultWithoutDependencies.pipe(
    Layer.provide(getEntityDetailsServiceLive),
  );

describe('GetDefiPlazaPositionsService', () => {
  it.effect(
    'should get defi plaza positions',
    () =>
      Effect.gen(function* () {
        const getDefiPlazaPositions = yield* Effect.provide(
          GetDefiPlazaPositionsService,
          getDefiPlazaPositionsLive,
        ).pipe(
          Effect.provideService(
            GetResourcePoolUnitsService,
            new GetResourcePoolUnitsService(() =>
              Effect.gen(function* () {
                return pools;
              }),
            ),
          ),
          Effect.provideService(
            GetFungibleBalanceService,
            new GetFungibleBalanceService(() =>
              Effect.gen(function* () {
                return fungibleBalance;
              }),
            ),
          ),
        );

        const result = yield* getDefiPlazaPositions({
          accountAddresses: [
            // contains xUSDC BaseLP tokens
            'account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr',
          ],
          at_ledger_state: {
            timestamp: new Date('2025-06-17T00:00:00Z'),
          },
        });

        const expected = [
          {
            address:
              'account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr',
            items: [
              {
                lpResourceAddress:
                  'resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [7, 51502246182330, 84573034350913, 20194622710000],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 2,
                      c: [626, 33574610300727, 93930981736376, 54973734830000],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1thnmcry6e02x6ja73llm8z6pkrurvrsudgez4ammsp24r0v20rllxt',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1t5k00sp4jejklp8cx6nw7ecvhz7z07mfexgmdyflgqpflfvzv8v7wd',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1t4x7f34hec2jxtay6cvxvcq3skmkg9pwtr98m4dm7qfrvnaddlavgv',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1t5q26nr5t02pzf40tp9z999ex7d84szldnpqg8e459jyvztrxhqqls',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1tknxlx2sy23qkg6twvnu3kqcd5l4daacq0n6mdam54upqgx50f4ju8',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1tkcczq5ahrk3ysllftmmy3h9ghejqcwm53ywwymkdlcv0fc3tsy4en',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t42hpqvsk4t42l6aw09hwphd2axvetp6gvas9ztue0p30f4hzdwxrp',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1t5908ql2dhz0m33dfljq8803z99jmeqrej98tjf9g6shadj7tvgjle',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1t4z3dn6u57kj069wru4tkmdrx8njz2d9a5rlfsphs87cyuaj9tufv0',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1tkmvuls8ktxwt7trrs5cvjeu8rk5036l6kr07s84gr0jzqmwk4qmdh',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1thus6t5yn4msedhslmyclqdduunrat85w6q6tmnep7h0vg3hcsmawk',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1tk3fxrz75ghllrqhyq8e574rkf4lsq2x5a0vegxwlh3defv225cth3',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1thj6rq8ceh6n4zvwswwh8f0xmuzs263eyg7t35uupujh88xa66v5wh',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1tha0rthe4jgmwuz0074eazu3n8w2v8m5mpx453vq5ux7dqnaxz0y0g',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1t5qsyevr7ry54uxeh9s7nm6wjdan0c8ks63c2dmpdxsdumum2vsl82',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1tkaems6ywyrqrs7vk0fjk87s8sa2n0wcc4zzkyms04nu6mv739xpyd',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1t46hgy2ut87zeu8jfv6k24d8l4s7mjwjdqsd2qnvu644gyc4l7g0xn',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
              {
                lpResourceAddress:
                  'resource_rdx1tkuxyrqa6lzpsmh75v9af55v4q5gu35wxx0wh30lz6uqd265u0hgvq',
                position: [
                  {
                    resourceAddress:
                      'resource_rdx1t5ljlq97xfcewcdjxsqld89443fchqg96xv8a8k8gdftdycy9haxpx',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                ],
              },
            ],
          },
        ].map((item) => ({
          ...item,
          items: item.items.map((item) => ({
            ...item,
            position: item.position.map((item) => ({
              ...item,
              amount: deserializeBigNumber(item.amount),
            })),
          })),
        }));

        expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
      }),
    30_000,
  );
});
