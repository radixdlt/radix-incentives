import BigNumber from 'bignumber.js';
import {
  type ActivityId,
  defiPlazaComponentSet,
  matchActivityId,
  shapeLiquidityComponentSet,
} from 'data';
import { Effect } from 'effect';
import {
  AddressValidationService,
  AddressValidationServiceLive,
} from '../../common/address-validation/addressValidation';
import { GetAccountsIntersectionService } from '../account/getAccountsIntersection';
import type { CaviarnineSwapEvent } from '../events/event-matchers/caviarnineEventMatcher';
import type { CapturedEvent } from '../events/event-matchers/createEventMatcher';
import type { DefiPlazaSwapEvent } from '../events/event-matchers/defiPlazaEventMatcher';
import type { HLPEmittableEvents } from '../events/event-matchers/hlpEventMatcher';
import type { OciswapSwapEvent } from '../events/event-matchers/ociswapEventMatcher';
import type { SurgeEmittableEvents } from '../events/event-matchers/surgeEventMatcher';
import type { EmittableEvent } from '../events/event-matchers/types';
import { MarginAccountDbService } from '../surge/marginAccountDbService';
import { GetUsdValueService } from '../token-price/getUsdValue';

export type TradingEvent = CaviarnineSwapEvent;

export type TradingEventWithTokens = {
  activityId: ActivityId;
  transactionId: string;
  timestamp: Date;
  inputToken: string;
  inputAmount: BigNumber;
  usdValue: BigNumber;
  accountAddress?: string; // For Surge, this will be the trading account address
};

export type FilterTradingEventsOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof FilterTradingEventsService)['Service']>>
>;

export class FilterTradingEventsService extends Effect.Service<FilterTradingEventsService>()(
  'FilterTradingEventsService',
  {
    dependencies: [
      GetUsdValueService.Default,
      AddressValidationServiceLive,
      MarginAccountDbService.Default,
      GetAccountsIntersectionService.Default,
    ],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;
      const addressValidationService = yield* AddressValidationService;
      const marginAccountDbService = yield* MarginAccountDbService;
      const getAccountsIntersectionService =
        yield* GetAccountsIntersectionService;
      return Effect.fn(function* (input: CapturedEvent<EmittableEvent>[]) {
        const tradingEvents: TradingEventWithTokens[] = [];

        for (const event of input) {
          if (
            event.dApp === 'Caviarnine' &&
            event.eventData.type === 'SwapEvent'
          ) {
            const swapEvent = event as CapturedEvent<CaviarnineSwapEvent>;
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter,
              );

            if (activityId) {
              const swapData = swapEvent.eventData.data;
              let inputToken: string | undefined;
              let inputAmount = new BigNumber(0);

              // Check if this is a precision pool SwapEvent (has amount_change_x/y)
              if (
                'amount_change_x' in swapData &&
                'amount_change_y' in swapData
              ) {
                // Precision pool swap event
                const pool = shapeLiquidityComponentSet.get(
                  swapEvent.globalEmitter,
                );

                if (pool) {
                  const amountChangeX = new BigNumber(swapData.amount_change_x);
                  const amountChangeY = new BigNumber(swapData.amount_change_y);

                  // Determine which token was the input (has negative change) and which was output (positive change)
                  if (
                    amountChangeX.isNegative() &&
                    amountChangeY.isPositive()
                  ) {
                    // X token was input, Y token was output
                    inputToken = pool.token_x;
                    inputAmount = amountChangeX.abs();
                  }

                  if (
                    amountChangeY.isNegative() &&
                    amountChangeX.isPositive()
                  ) {
                    // Y token was input, X token was output
                    inputToken = pool.token_y;
                    inputAmount = amountChangeY.abs();
                  }
                }
              } else if (
                'input_resource' in swapData &&
                'input_amount' in swapData
              ) {
                // HLP or SimplePool swap event
                inputToken = swapData.input_resource;
                inputAmount = new BigNumber(swapData.input_amount);
              }

              if (inputToken) {
                const usdValue = yield* getUsdValueService({
                  amount: inputAmount,
                  resourceAddress: inputToken,
                  timestamp: swapEvent.timestamp,
                });

                tradingEvents.push({
                  transactionId: swapEvent.transactionId,
                  timestamp: swapEvent.timestamp,
                  inputToken,
                  inputAmount,
                  usdValue,
                  activityId,
                });
              }
            }
          }

          if (
            event.dApp === 'DefiPlaza' &&
            event.eventData.type === 'SwapEvent'
          ) {
            const swapEvent = event as CapturedEvent<DefiPlazaSwapEvent>;

            const pool = defiPlazaComponentSet.get(swapEvent.globalEmitter);
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter,
              );

            if (pool && activityId) {
              const swapData = swapEvent.eventData.data;
              const baseAmount = new BigNumber(swapData.base_amount);
              const quoteAmount = new BigNumber(swapData.quote_amount);

              let inputToken: string | undefined;
              let inputAmount = new BigNumber(0);

              // Determine which token was the input (has negative change) and which was output (positive change)
              if (baseAmount.isNegative() && quoteAmount.isPositive()) {
                // base token was input, quote token was output
                inputToken = pool.baseResourceAddress;
                inputAmount = baseAmount.abs();
              }

              if (quoteAmount.isNegative() && baseAmount.isPositive()) {
                // quote token was input, base token was output
                inputToken = pool.quoteResourceAddress;
                inputAmount = quoteAmount.abs();
              }

              if (inputToken) {
                const usdValue = yield* getUsdValueService({
                  amount: inputAmount,
                  resourceAddress: inputToken,
                  timestamp: swapEvent.timestamp,
                });

                tradingEvents.push({
                  transactionId: swapEvent.transactionId,
                  timestamp: swapEvent.timestamp,
                  inputToken,
                  inputAmount,
                  usdValue,
                  activityId,
                });
              }
            }
          }

          if (event.dApp === 'HLP' && event.eventData.type === 'SwapEvent') {
            const swapEvent = event as CapturedEvent<HLPEmittableEvents>;
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter,
              );

            if (activityId) {
              const swapData = swapEvent.eventData.data;
              const inputAmount = new BigNumber(swapData.input_amount);
              const inputToken = swapData.input_resource;

              const usdValue = yield* getUsdValueService({
                amount: inputAmount,
                resourceAddress: inputToken,
                timestamp: swapEvent.timestamp,
              });

              tradingEvents.push({
                transactionId: swapEvent.transactionId,
                timestamp: swapEvent.timestamp,
                inputToken,
                inputAmount,
                usdValue,
                activityId,
              });
            }
          }

          if (
            event.dApp === 'Ociswap' &&
            event.eventData.type === 'SwapEvent'
          ) {
            const swapEvent = event as CapturedEvent<OciswapSwapEvent>;
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter,
              );

            if (activityId) {
              const swapData = swapEvent.eventData.data;
              const inputAmount = new BigNumber(swapData.input_amount);
              const inputToken = swapData.input_address;

              const usdValue = yield* getUsdValueService({
                amount: inputAmount,
                resourceAddress: inputToken,
                timestamp: swapEvent.timestamp,
              });

              tradingEvents.push({
                transactionId: swapEvent.transactionId,
                timestamp: swapEvent.timestamp,
                inputToken,
                inputAmount,
                usdValue,
                activityId,
              });
            }
          }

          // Handle Surge trading events
          if (event.dApp === 'Surge') {
            const surgeEvent =
              event as unknown as CapturedEvent<SurgeEmittableEvents>;

            // Skip non-trading events
            if (
              surgeEvent.eventData.type === 'EventAccountCreation' ||
              surgeEvent.eventData.type === 'EventSignalUpgrade' ||
              surgeEvent.eventData.type === 'EventAddCollateral' ||
              surgeEvent.eventData.type === 'EventRemoveCollateral'
            ) {
              continue;
            }

            // Convert margin account to trading account using state version
            const tradingAccountResult =
              yield* marginAccountDbService.getTradingAccountAtStateVersion(
                surgeEvent.eventData.data.account,
                surgeEvent.stateVersion,
              );

            if (!tradingAccountResult) {
              continue;
            }

            // Check if trading account is registered in the incentives program
            const registeredAccounts = yield* getAccountsIntersectionService({
              addresses: [tradingAccountResult],
            });

            if (registeredAccounts.length === 0) {
              // Skip if trading account is not registered in incentives program
              continue;
            }

            let usdValue: BigNumber | null = null;
            let pairId: string = '';

            // Calculate USD value and get pair_id based on event type
            if (surgeEvent.eventData.type === 'EventMarginOrder') {
              const data = surgeEvent.eventData.data;
              const price = new BigNumber(data.price);
              const amountClose = new BigNumber(data.amount_close).abs();
              const amountOpen = new BigNumber(data.amount_open).abs();
              // Total volume is price * (|amount_close| + |amount_open|)
              usdValue = price.times(amountClose.plus(amountOpen));
              pairId = data.pair_id;
            } else if (surgeEvent.eventData.type === 'EventLiquidate') {
              const data = surgeEvent.eventData.data;
              // Multiple positions: sum of position_prices * position_amounts
              // position_prices and position_amounts are arrays of tuples [pair_id, value]
              usdValue = new BigNumber(0);

              // Validate that position arrays exist and are properly structured
              if (
                !Array.isArray(data.position_prices) ||
                !Array.isArray(data.position_amounts)
              ) {
                yield* Effect.logWarning(
                  `EventLiquidate has malformed position arrays in transaction ${surgeEvent.transactionId}. Skipping trading volume calculation.`,
                );
                continue;
              }

              // Create a map for quick lookup of amounts by pair_id
              const amountMap = new Map(data.position_amounts);

              // Validate that all prices have corresponding amounts
              const priceIds = new Set(
                data.position_prices.map(([pairId]) => pairId),
              );
              const amountIds = new Set(
                data.position_amounts.map(([pairId]) => pairId),
              );
              const missingAmounts = Array.from(priceIds).filter(
                (id) => !amountIds.has(id),
              );

              if (missingAmounts.length > 0) {
                yield* Effect.logWarning(
                  `EventLiquidate missing amounts for pairs [${missingAmounts.join(', ')}] in transaction ${surgeEvent.transactionId}. Using 0 for missing amounts.`,
                );
              }

              for (const [pairIdFromPrice, priceStr] of data.position_prices) {
                const price = new BigNumber(priceStr || '0');
                const amount = new BigNumber(
                  amountMap.get(pairIdFromPrice) || '0',
                ).abs();

                if (price.isZero() && priceStr) {
                  yield* Effect.logWarning(
                    `EventLiquidate has invalid price "${priceStr}" for pair ${pairIdFromPrice} in transaction ${surgeEvent.transactionId}`,
                  );
                }

                usdValue = usdValue.plus(price.times(amount));
              }

              // For liquidation events, we'll use the first position's pair_id
              // or aggregate all pairs (for now, use the first one)
              pairId =
                data.position_prices.length > 0 && data.position_prices[0]
                  ? data.position_prices[0][0]
                  : '';
            } else if (surgeEvent.eventData.type === 'EventAutoDeleverage') {
              const data = surgeEvent.eventData.data;
              const price = new BigNumber(data.price);
              const amountClose = new BigNumber(data.amount_close).abs();
              usdValue = price.times(amountClose);
              pairId = data.pair_id;
            }

            if (usdValue?.gt(0) && pairId) {
              // Convert pair_id (e.g., "BTC/USD") to activity ID format (e.g., "su_tr_btc-usd")
              const tokenPair = pairId.toLowerCase().replace('/', '-');
              const proposedActivityId = `su_tr_${tokenPair}`;

              // Validate that the activity ID exists in our system
              if (!matchActivityId(proposedActivityId)) {
                yield* Effect.logWarning(
                  `Skipping Surge trading event for unknown token pair: ${pairId}. Activity ID '${proposedActivityId}' not found in activities list. Consider adding this pair to generateActivities.ts if it should be tracked.`,
                );
                continue;
              }

              const activityId = proposedActivityId as ActivityId;

              tradingEvents.push({
                transactionId: surgeEvent.transactionId,
                timestamp: surgeEvent.timestamp,
                inputToken: tokenPair, // Use the token pair as input token
                inputAmount: usdValue, // Use USD value as amount since it's already calculated
                usdValue, // Dollar value from price * amount calculation
                activityId,
                accountAddress: tradingAccountResult,
              });
            }
          }
        }

        return tradingEvents;
      });
    }),
  },
) {}

export const FilterTradingEventsServiceLive =
  FilterTradingEventsService.Default;
