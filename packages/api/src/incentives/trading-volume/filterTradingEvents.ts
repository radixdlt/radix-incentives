import { Context, Effect, Layer } from "effect";

import type { EmittableEvent } from "../events/event-matchers/types";
import type { CapturedEvent } from "../events/event-matchers/createEventMatcher";
import type { CaviarnineSwapEvent } from "../events/event-matchers/caviarnineEventMatcher";
import {
  shapeLiquidityComponentSet,
  defiPlazaComponentSet,
  type ActivityId,
} from "data";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import BigNumber from "bignumber.js";

import type { DefiPlazaSwapEvent } from "../events/event-matchers/defiPlazaEventMatcher";
import type { HLPEmittableEvents } from "../events/event-matchers/hlpEventMatcher";
import type { OciswapSwapEvent } from "../events/event-matchers/ociswapEventMatcher";
import { AddressValidationService } from "../../common/address-validation/addressValidation";

export type TradingEvent = CaviarnineSwapEvent;

export type TradingEventWithTokens = {
  activityId: ActivityId;
  transactionId: string;
  timestamp: Date;
  inputToken: string;
  inputAmount: BigNumber;
  usdValue: BigNumber;
};

export type FilterTradingEventsServiceError = GetUsdValueServiceError;

export class FilterTradingEventsService extends Context.Tag(
  "FilterTradingEventsService"
)<
  FilterTradingEventsService,
  (
    input: CapturedEvent<EmittableEvent>[]
  ) => Effect.Effect<TradingEventWithTokens[], FilterTradingEventsServiceError>
>() {}

export const FilterTradingEventsLive = Layer.effect(
  FilterTradingEventsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const addressValidationService = yield* AddressValidationService;
    return (input) => {
      return Effect.gen(function* () {
        const tradingEvents: TradingEventWithTokens[] = [];

        for (const event of input) {
          if (
            event.dApp === "Caviarnine" &&
            event.eventData.type === "SwapEvent"
          ) {
            const swapEvent = event as CapturedEvent<CaviarnineSwapEvent>;
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter
              );

            if (activityId) {
              const swapData = swapEvent.eventData.data;
              let inputToken: string | undefined;
              let inputAmount = new BigNumber(0);

              // Check if this is a precision pool SwapEvent (has amount_change_x/y)
              if (
                "amount_change_x" in swapData &&
                "amount_change_y" in swapData
              ) {
                // Precision pool swap event
                const pool = shapeLiquidityComponentSet.get(
                  swapEvent.globalEmitter
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
                "input_resource" in swapData &&
                "input_amount" in swapData
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
            event.dApp === "DefiPlaza" &&
            event.eventData.type === "SwapEvent"
          ) {
            const swapEvent = event as CapturedEvent<DefiPlazaSwapEvent>;

            const pool = defiPlazaComponentSet.get(swapEvent.globalEmitter);
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter
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

          if (event.dApp === "HLP" && event.eventData.type === "SwapEvent") {
            const swapEvent = event as CapturedEvent<HLPEmittableEvents>;
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter
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
            event.dApp === "Ociswap" &&
            event.eventData.type === "SwapEvent"
          ) {
            const swapEvent = event as CapturedEvent<OciswapSwapEvent>;
            const activityId =
              addressValidationService.getTradingActivityIdForPool(
                swapEvent.globalEmitter
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
        }

        return tradingEvents;
      });
    };
  })
);
