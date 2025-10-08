import { it } from '@effect/vitest';
import { type AccountBalanceData, Action } from 'data';
import { Effect, Layer } from 'effect';
import { AddressValidationServiceLive } from '../../common/address-validation/addressValidation';
import { FetchService } from '../../common/helpers';
import { GetUsdValueLive } from '../token-price/getUsdValue';
import { AggregateOciswapPositionsService } from './aggregateOciswapPositions';
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

const aggregateOciswapPositionsLive =
  AggregateOciswapPositionsService.Default.pipe(
    Layer.provide(aggregatePoolPositionsLive),
  );

describe('AggregateOciswapPositionsService', () => {
  it.effect(
    'should return defaults when no positions are found',
    () =>
      Effect.gen(function* () {
        const ociswapLpActivityIds = yield* getDefaultPositions('oc', [
          Action.HOLD,
          Action.LP,
        ]).pipe(Effect.map((items) => items.map((item) => item.activityId)));

        const expectedActivityIds = new Set(ociswapLpActivityIds);

        const service = yield* Effect.provide(
          AggregateOciswapPositionsService,
          aggregateOciswapPositionsLive,
        );

        const result = yield* service({
          accountBalance: {
            positions: [],
          },
          timestamp: new Date(),
        });

        // Check that defaults are returned for all expected activity ids
        for (const position of result) {
          expect(
            expectedActivityIds.has(position.activityId),
            `expected activity id ${position.activityId} to be defined`,
          ).toBe(true);
          expect(position.usdValue).toBe('0');
        }

        // Check that all expected activity ids are present
        for (const activityId of expectedActivityIds) {
          const position = result.find((p) => p.activityId === activityId);
          expect(
            position,
            `expected activity id ${activityId} to be defined`,
          ).toBeDefined();
        }
      }),
    { retry: 0 },
  );

  // TODO: Re-enable after updating fixtures for new component definitions
  it.effect.skip(
    'should return positions when they are found',
    () =>
      Effect.gen(function* () {
        const input = {
          accountBalance: {
            component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr:
              [
                {
                  xToken: {
                    totalAmount: '0.00001907',
                    amountInBounds: '0.00000664',
                    resourceAddress:
                      'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
                  },
                  yToken: {
                    totalAmount: '169.30904980055631622',
                    amountInBounds: '120.356564478853522749',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                  isActive: true,
                },
              ],
            component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm:
              [
                {
                  xToken: {
                    totalAmount: '236.193153989167066908',
                    amountInBounds: '88.485432878916357568',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                  yToken: {
                    totalAmount: '0.000434192411259383',
                    amountInBounds: '0.000277434522842954',
                    resourceAddress:
                      'resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww',
                  },
                  isActive: true,
                },
              ],
            component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f:
              [
                {
                  xToken: {
                    totalAmount: '4.248225',
                    amountInBounds: '0.977414',
                    resourceAddress:
                      'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
                  },
                  yToken: {
                    totalAmount: '631.970865015454801434',
                    amountInBounds: '152.368778115657327807',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                  isActive: true,
                },
              ],
            component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g:
              [
                {
                  xToken: {
                    totalAmount: '166.939235877607691196',
                    amountInBounds: '100.066885675859432595',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                  yToken: {
                    totalAmount: '2.583447',
                    amountInBounds: '1.137797',
                    resourceAddress:
                      'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw',
                  },
                  isActive: true,
                },
              ],
            component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp:
              [
                {
                  xToken: {
                    totalAmount: '232.883965673937591809',
                    amountInBounds: '96.2997800336819719',
                    resourceAddress:
                      'resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8',
                  },
                  yToken: {
                    totalAmount: '212.862210401318865367',
                    amountInBounds: '121.494128932301811473',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                  isActive: true,
                },
              ],
            component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd:
              [
                {
                  xToken: {
                    totalAmount: '286.78361117925567465544897935822220277365',
                    amountInBounds:
                      '286.78361117925567465544897935822220277365',
                    resourceAddress:
                      'resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2',
                  },
                  yToken: {
                    totalAmount: '248.3925710476777195290837035468975838975',
                    amountInBounds: '248.3925710476777195290837035468975838975',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                },
              ],
            component_rdx1cz8p5lc8vmj96hdguy02hkfq4z5xyxf9k759dj8ym8exj8x8zgmw9p:
              [
                {
                  xToken: {
                    totalAmount: '768.02507669935598006464156597557261955444',
                    amountInBounds:
                      '768.02507669935598006464156597557261955444',
                    resourceAddress:
                      'resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s',
                  },
                  yToken: {
                    totalAmount: '91.12083884120455283137271359688668653964',
                    amountInBounds: '91.12083884120455283137271359688668653964',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                },
              ],
            component_rdx1cz89w3ecvh9jvdd892vycs44rr042lteg75zgdydq9csn5d87snvdw:
              [
                {
                  xToken: {
                    totalAmount: '109.7781300978726184248244827271419103956',
                    amountInBounds: '109.7781300978726184248244827271419103956',
                    resourceAddress:
                      'resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8',
                  },
                  yToken: {
                    totalAmount: '104.4638562598827175039440482459080632404',
                    amountInBounds: '104.4638562598827175039440482459080632404',
                    resourceAddress:
                      'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                  },
                },
              ],
          },
          timestamp: new Date('2025-07-20T00:00:00.000Z'),
        };

        const expected: Record<string, AccountBalanceData> = [
          {
            activityId: 'oc_lp_nat_ilis-xrd',
            usdValue:
              '1.04483603352485224242803777337327010427310395811140385765',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_der_ilis-xrd',
            usdValue: '1.04940396631080787591208224907086197449848005',
            metadata: undefined,
          },
          {
            activityId: 'oc_ho_ilis-xrd',
            usdValue: '2.0988079326216157518241644981417239489969601',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_blu_xrd-xwbtc',
            usdValue: '0.7644877982784',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_der_xrd-xwbtc',
            usdValue: '1.01696001295794157167904044',
            metadata: undefined,
          },
          {
            activityId: 'oc_ho_xrd-xwbtc',
            usdValue: '1.4305869748327886272798632',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_der_xeth-xrd',
            usdValue: '0.74766297423637649825227008',
            metadata: undefined,
          },
          {
            activityId: 'oc_ho_xeth-xrd',
            usdValue: '1.99572822622070648186316048',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_blu_xeth-xrd',
            usdValue: '0.993340514646564717245438645521',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_sta_xrd-xusdc',
            usdValue: '0.969030668110163125092',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_der_xrd-xusdc',
            usdValue: '1.28744913281493353074491492',
            metadata: undefined,
          },
          {
            activityId: 'oc_ho_xrd-xusdc',
            usdValue: '5.33987574219998627200466904',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_der_xrd-xusdt',
            usdValue: '0.8455211545313148272774082',
            metadata: undefined,
          },
          {
            activityId: 'oc_ho_xrd-xusdt',
            usdValue: '1.41056308990199884322207376',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_sta_xrd-xusdt',
            usdValue: '1.1266510682241108',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_nat_oci-xrd',
            usdValue: '1.21387352759922353769428907996458442485710905542328',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_der_oci-xrd',
            usdValue: '1.467908742710847401406114616148347467416777112',
            metadata: undefined,
          },
          {
            activityId: 'oc_ho_oci-xrd',
            usdValue: '2.681265639817822446563013992296694934833554224',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_nat_reddicks-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_der_reddicks-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_ho_reddicks-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_nat_weft-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_der_weft-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_ho_weft-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_der_husdc-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_ho_husdc-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_sta_husdc-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_der_husdt-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_ho_husdt-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_sta_husdt-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_blu_hwbtc-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_der_hwbtc-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_ho_hwbtc-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_der_heth-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_ho_heth-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_blu_heth-xrd',
            usdValue: '0',
          },
          {
            activityId: 'oc_lp_nat_early-xrd',
            usdValue:
              '0.384684985790892910092365242640142360006280802559668100664',
            metadata: undefined,
          },
          {
            activityId: 'oc_lp_der_early-xrd',
            usdValue: '0.3849654975195441707109268129498549355589402792',
            metadata: undefined,
          },
          {
            activityId: 'oc_ho_early-xrd',
            usdValue: '0.7699309950390883414218536258997098711178805584',
            metadata: undefined,
          },
        ].reduce(
          (acc, item) => {
            acc[item.activityId] = item;
            return acc;
          },
          {} as Record<string, AccountBalanceData>,
        );

        const service = yield* Effect.provide(
          AggregateOciswapPositionsService,
          aggregateOciswapPositionsLive,
        );

        const result = yield* service(input);

        for (const position of result) {
          const expectedPosition = expected[position.activityId];

          expect(
            expectedPosition,
            `expected position for ${position.activityId}`,
          ).toBeDefined();

          expect(
            position.usdValue,
            `usdValue for ${position.activityId}`,
          ).toEqual(expectedPosition.usdValue);
        }
      }),
    { retry: 0 },
  );
});
