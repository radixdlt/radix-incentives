import { Context, Effect, Layer } from "effect";

import type { EmittableEvent } from "../events/event-matchers/types";
import type { CapturedEvent } from "../events/event-matchers/createEventMatcher";
import type { CaviarnineSwapEvent } from "../events/event-matchers/caviarnineEventMatcher";
import {
  CaviarNineConstants,
  shapeLiquidityComponentSet,
} from "../../common/dapps/caviarnine/constants";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import BigNumber from "bignumber.js";
import type { ActivityId } from "db/incentives";
import {
  DefiPlaza,
  defiPlazaComponentSet,
} from "../../common/dapps/defiplaza/constants";
import type { DefiPlazaSwapEvent } from "../events/event-matchers/defiPlazaEventMatcher";

export type TradingEvent = CaviarnineSwapEvent;

export type TradingEventWithTokens = {
  activityId: ActivityId;
  transactionId: string;
  timestamp: Date;
  inputToken: string;
  inputAmount: BigNumber;
  usdValue: BigNumber;
};

const poolToActivityIdMap: Map<string, ActivityId> = new Map([
  [
    CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC.componentAddress,
    "c9_trade_xrd-xusdc",
  ],
  [DefiPlaza.xUSDCPool.componentAddress, "defiPlaza_trade_xrd-xusdc"],
]);

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
    return (input) => {
      return Effect.gen(function* () {
        const tradingEvents: TradingEventWithTokens[] = [];

        for (const event of input) {
          if (
            event.dApp === "Caviarnine" &&
            event.eventData.type === "SwapEvent"
          ) {
            const swapEvent = event as CapturedEvent<CaviarnineSwapEvent>;
            const pool = shapeLiquidityComponentSet.get(
              swapEvent.globalEmitter
            );
            const activityId = poolToActivityIdMap.get(swapEvent.globalEmitter);

            if (pool && activityId) {
              const swapData = swapEvent.eventData.data;
              const amountChangeX = new BigNumber(swapData.amount_change_x);
              const amountChangeY = new BigNumber(swapData.amount_change_y);

              let inputToken: string | undefined;
              let inputAmount = new BigNumber(0);

              // Determine which token was the input (has negative change) and which was output (positive change)
              if (amountChangeX.isNegative() && amountChangeY.isPositive()) {
                // X token was input, Y token was output
                inputToken = pool.token_x;
                inputAmount = amountChangeX.abs();
              }

              if (amountChangeY.isNegative() && amountChangeX.isPositive()) {
                // Y token was input, X token was output
                inputToken = pool.token_y;
                inputAmount = amountChangeY.abs();
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
            const activityId = poolToActivityIdMap.get(swapEvent.globalEmitter);

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
        }

        return tradingEvents;
      });
    };
  })
);
