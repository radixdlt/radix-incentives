import { it } from '@effect/vitest';
import BigNumber from 'bignumber.js';
import { type AccountBalanceData, Action } from 'data';
import { Effect, Layer } from 'effect';
import { AddressValidationServiceLive } from '../../common/address-validation/addressValidation';
import { FetchService } from '../../common/helpers';
import { GetUsdValueLive } from '../token-price/getUsdValue';
import { AggregateDefiPlazaPositionsService } from './aggregateDefiPlazaPositions';
import { AggregatePoolPositionsService } from './aggregatePoolPositions';
import { getDefaultPositions } from './getDefaultPositions';

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(AddressValidationServiceLive),
  Layer.provide(FetchService.Default),
);

const aggregatePoolPositionsLive = AggregatePoolPositionsService.Default.pipe(
  Layer.provide(AddressValidationServiceLive),
  Layer.provide(getUsdValueLive),
);

const aggregateDefiPlazaPositionsLive =
  AggregateDefiPlazaPositionsService.Default.pipe(
    Layer.provide(aggregatePoolPositionsLive),
  );

describe('AggregateDefiPlazaPositionsService', () => {
  it.effect(
    'should return defaults when no positions are found',
    () =>
      Effect.gen(function* () {
        const defiPlazaLpActivityIds = yield* getDefaultPositions('dp', [
          Action.HOLD,
          Action.LP,
        ]).pipe(Effect.map((items) => items.map((item) => item.activityId)));

        const expectedActivityIds = new Set(defiPlazaLpActivityIds);

        const service = yield* Effect.provide(
          AggregateDefiPlazaPositionsService,
          aggregateDefiPlazaPositionsLive,
        );
        const result = yield* service({
          accountBalance: {
            address: '',
            items: [],
          },
          timestamp: new Date('2025-07-20T00:00:00.000Z'),
        });

        // Check that defaults are returned for all expected activity ids
        for (const position of result) {
          expect(expectedActivityIds.has(position.activityId)).toBe(true);
          expect(position.usdValue).toBe('0');
        }

        // Check that all expected activity ids are present
        for (const activityId of expectedActivityIds) {
          const position = result.find((p) => p.activityId === activityId);

          expect(
            position,
            `Position not found for activity id: ${activityId}`,
          ).toBeDefined();
        }
      }),
    { retry: 0 },
  );
  it.effect('should return positions when they are found', () =>
    Effect.gen(function* () {
      const expected: Record<string, AccountBalanceData> = [
        {
          activityId: 'dp_lp_sta_xrd-xusdc',
          usdValue: '0.01751845154575657132546679227395606258150372121515846',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_der_xrd-xusdc',
          usdValue: '0.4497913456138135326409595090285959240072796448',
          metadata: undefined,
        },
        {
          activityId: 'dp_ho_xrd-xusdc',
          usdValue: '0.8995826912276270652819190180571918480145592896',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_sta_xrd-xusdt',
          usdValue: '0.268881428102894680225654190054115317346394002912',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_der_xrd-xusdt',
          usdValue: '0.5889840574150880767959712252132446879854760252',
          metadata: undefined,
        },
        {
          activityId: 'dp_ho_xrd-xusdt',
          usdValue: '1.1779681148301761535919424504264893759709520504',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_blu_xeth-xrd',
          usdValue: '0.1562077622482928409600801327272597596581097921128',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_der_xeth-xrd',
          usdValue: '0.5124882479304346093078840030537102885638722784',
          metadata: undefined,
        },
        {
          activityId: 'dp_ho_xeth-xrd',
          usdValue: '1.0249764958608692186157680061074205771277445568',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_blu_xrd-xwbtc',
          usdValue: '0.300621884523159643607733728509538747253288',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_der_xrd-xwbtc',
          usdValue: '0.6349132477099749380156771409980890323186999474',
          metadata: undefined,
        },
        {
          activityId: 'dp_ho_xrd-xwbtc',
          usdValue: '1.2698264954199498760313542819961780646373998948',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_nat_astrl-dfp2',
          usdValue: '1.168604040275732055329504082241654729288785198161612364',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_der_dfp2-xrd',
          usdValue: '0.4363159437378297727627358894388481016997883182',
          metadata: undefined,
        },
        {
          activityId: 'dp_ho_dfp2-xrd',
          usdValue: '0.8726318874756595455254717788776962033995766364',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_nat_dfp2-xrd',
          usdValue:
            '0.42774466860186911257522044085695562436070697873196774025',
          metadata: undefined,
        },
        {
          activityId: 'dp_lp_nat_dfp2-reddicks',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_nat_dfp2-early',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_nat_dfp2-ilis',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_nat_dfp2-floop',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_nat_dfp2-weft',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_nat_dfp2-oci',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_blu_heth-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_der_heth-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_ho_heth-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_sta_husdc-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_der_husdc-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_ho_husdc-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_blu_hwbtc-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_der_hwbtc-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_ho_hwbtc-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_sta_husdt-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_der_husdt-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_ho_husdt-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_blu_hsol-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_lp_der_hsol-xrd',
          usdValue: '0',
        },
        {
          activityId: 'dp_ho_hsol-xrd',
          usdValue: '0',
        },
      ].reduce(
        (acc, item) => {
          acc[item.activityId] = item;
          return acc;
        },
        {} as Record<string, AccountBalanceData>,
      );

      const service = yield* Effect.provide(
        AggregateDefiPlazaPositionsService,
        aggregateDefiPlazaPositionsLive,
      );

      const input = [
        {
          lpResourceAddress:
            'resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x',
          position: [
            {
              resourceAddress:
                'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
              amount: '0.03534001629182190152882788276480782114',
            },
            {
              resourceAddress:
                'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
              amount: '106.46503382751611507367472602800522725616',
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
              amount: '0.54308293113930440688087369646234284016',
            },
            {
              resourceAddress:
                'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
              amount: '139.41176994188764309525495415459377482034',
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
              amount: '0.0000872559315657036098814470515405344',
            },
            {
              resourceAddress:
                'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
              amount: '121.30531008252136426225365653447286925328',
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
              amount: '0.0000052221351805195426191145869007646',
            },
            {
              resourceAddress:
                'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
              amount: '150.28315029657755859847782393357501037183',
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
              amount: '31.62732999185709355405716373852248135858',
            },
            {
              resourceAddress:
                'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
              amount: '69.9249977801652589965340509543833507592',
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
              amount: '103.27542351029634034499687307714202909969',
            },
            {
              resourceAddress:
                'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
              amount: '90.57390696483483330539138629935583491895',
            },
          ],
        },
      ].map((item) => ({
        ...item,
        position: item.position.map((position) => ({
          ...position,
          amount: new BigNumber(position.amount),
        })),
      }));

      const result = yield* service({
        accountBalance: {
          address: '',
          items: input,
        },
        timestamp: new Date('2025-07-20T00:00:00.000Z'),
      });

      for (const position of result) {
        const expectedPosition = expected[position.activityId];

        expect(
          position.usdValue,
          `usdValue for ${position.activityId}`,
        ).toEqual(expectedPosition.usdValue);
      }
    }),
  );
});
