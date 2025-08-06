import { Effect } from 'effect';
import { isDefiPlazaPoolComponent } from '../../../common/address-validation/addressValidation';
import {
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  SwapEvent,
} from '../../../common/dapps/defiplaza/schemas';
import type { TransformedEvent } from '../../transaction-stream/transformEvent';
import {
  type CapturedEvent,
  createEventMatcher,
  parseEventData,
} from './createEventMatcher';

export type DefiPlazaSwapEvent = {
  readonly type: 'SwapEvent';
  data: SwapEvent;
};

export type DefiPlazaEmittableEvents =
  | { readonly type: 'AddLiquidityEvent'; data: AddLiquidityEvent }
  | { readonly type: 'RemoveLiquidityEvent'; data: RemoveLiquidityEvent }
  | DefiPlazaSwapEvent;

export type CapturedDefiPlazaEvent = CapturedEvent<DefiPlazaEmittableEvents>;

export const defiPlazaEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    if (!isDefiPlazaPoolComponent(input.emitter.globalEmitter))
      return yield* Effect.succeed(null);

    switch (input?.event.name) {
      case 'AddLiquidityEvent':
        return yield* parseEventData(input, AddLiquidityEvent);
      case 'RemoveLiquidityEvent':
        return yield* parseEventData(input, RemoveLiquidityEvent);
      case 'SwapEvent':
        return yield* parseEventData(input, SwapEvent);
    }

    yield* Effect.log(
      `No match found for event: defiplaza.${input?.event.name}`,
    );

    return yield* Effect.succeed(null);
  });

export const defiPlazaEventMatcher = createEventMatcher(
  {
    dApp: 'DefiPlaza',
    category: 'DEX',
  },
  defiPlazaEventMatcherFn,
);
