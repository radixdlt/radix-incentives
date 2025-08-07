import { Effect } from 'effect';
import { isRootFinanceComponent } from '../../../common/address-validation/addressValidation';
import {
  type CDPLiquidableEvent as CDPLiquidableEventType,
  CDPUpdatedEvent,
  type CDPUpdatedEvent as CDPUpdatedEventType,
  type LendingPoolUpdatedEvent as LendingPoolUpdatedEventType,
} from '../../../common/dapps/rootFinance/schema';
import type { TransformedEvent } from '../../transaction-stream/transformEvent';
import {
  type CapturedEvent,
  createEventMatcher,
  parseEventData,
} from './createEventMatcher';

export type RootFinanceEmittableEvents =
  | { readonly type: 'CDPUpdatedEvent'; data: CDPUpdatedEventType }
  | { readonly type: 'CDPLiquidableEvent'; data: CDPLiquidableEventType }
  | {
      readonly type: 'LendingPoolUpdatedEvent';
      data: LendingPoolUpdatedEventType;
    };

export type CapturedRootFinanceEvent =
  CapturedEvent<RootFinanceEmittableEvents>;

export const rootFinanceEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    if (
      !isRootFinanceComponent(
        input.emitter.globalEmitter,
        input.package.address,
      )
    ) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case 'CDPUpdatedEvent':
        return yield* parseEventData(input, CDPUpdatedEvent);
      case 'CDPLiquidableEvent':
      case 'LendingPoolUpdatedEvent':
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(
      `No match found for event: rootFinance.${input?.event.name}`,
    );

    return yield* Effect.succeed(null);
  });

export const rootFinanceEventMatcher = createEventMatcher(
  {
    dApp: 'RootFinance',
    category: 'Lending',
  },
  rootFinanceEventMatcherFn,
);
