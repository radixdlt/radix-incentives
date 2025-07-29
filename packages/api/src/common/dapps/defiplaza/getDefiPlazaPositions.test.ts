import { Effect, Layer } from "effect";
import { it } from "@effect/vitest";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";

import {
  GetDefiPlazaPositionsLive,
  GetDefiPlazaPositionsService,
} from "./getDefiPlazaPositions";
import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";
import { GetResourcePoolUnitsService } from "../../resource-pool/getResourcePoolUnits";
import { pools } from "./fixtures/pools";
import { fungibleBalance } from "./fixtures/fungibleBalance";
import { deserializeBigNumber } from "../../utils/deserializeBigNumber";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getDefiPlazaPositionsLive = GetDefiPlazaPositionsLive.pipe(
  Layer.provide(getEntityDetailsServiceLive)
);

describe("GetDefiPlazaPositionsService", () => {
  it.effect(
    "should get defi plaza positions",
    () =>
      Effect.gen(function* () {
        const getDefiPlazaPositions = yield* Effect.provide(
          GetDefiPlazaPositionsService,
          getDefiPlazaPositionsLive
        ).pipe(
          Effect.provideService(
            GetResourcePoolUnitsService,
            new GetResourcePoolUnitsService(() =>
              Effect.gen(function* () {
                return pools;
              })
            )
          ),
          Effect.provideService(
            GetFungibleBalanceService,
            new GetFungibleBalanceService(() =>
              Effect.gen(function* () {
                return fungibleBalance;
              })
            )
          )
        );

        const result = yield* getDefiPlazaPositions({
          accountAddresses: [
            // contains xUSDC BaseLP tokens
            "account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr",
          ],
          at_ledger_state: {
            timestamp: new Date("2025-06-17T00:00:00Z"),
          },
        });

        const expected = [
          {
            address:
              "account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr",
            items: [
              {
                lpResourceAddress:
                  "resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x",
                position: [
                  {
                    resourceAddress:
                      "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
                    amount: {
                      s: 1,
                      e: 0,
                      c: [7, 51502246182330, 84573034350913, 20194622710000],
                    },
                  },
                  {
                    resourceAddress:
                      "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
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
                  "resource_rdx1thnmcry6e02x6ja73llm8z6pkrurvrsudgez4ammsp24r0v20rllxt",
                position: [
                  {
                    resourceAddress:
                      "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
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
                  "resource_rdx1t5k00sp4jejklp8cx6nw7ecvhz7z07mfexgmdyflgqpflfvzv8v7wd",
                position: [
                  {
                    resourceAddress:
                      "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww",
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
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
                  "resource_rdx1t4x7f34hec2jxtay6cvxvcq3skmkg9pwtr98m4dm7qfrvnaddlavgv",
                position: [
                  {
                    resourceAddress:
                      "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
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
                  "resource_rdx1t5q26nr5t02pzf40tp9z999ex7d84szldnpqg8e459jyvztrxhqqls",
                position: [
                  {
                    resourceAddress:
                      "resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3",
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      "resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq",
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
                  "resource_rdx1tknxlx2sy23qkg6twvnu3kqcd5l4daacq0n6mdam54upqgx50f4ju8",
                position: [
                  {
                    resourceAddress:
                      "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                    amount: {
                      s: 1,
                      e: 0,
                      c: [0],
                    },
                  },
                  {
                    resourceAddress:
                      "resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq",
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
    30_000
  );
});
