import { Effect } from 'effect';
import {
  EventAccountCreation,
  type EventAccountCreation as EventAccountCreationType,
  EventAddCollateral,
  type EventAddCollateral as EventAddCollateralType,
  EventAutoDeleverage,
  type EventAutoDeleverage as EventAutoDeleverageType,
  EventLiquidate,
  type EventLiquidate as EventLiquidateType,
  EventMarginOrder,
  type EventMarginOrder as EventMarginOrderType,
  EventRemoveCollateral,
  type EventRemoveCollateral as EventRemoveCollateralType,
  EventSignalUpgrade,
  type EventSignalUpgrade as EventSignalUpgradeType,
} from '../../../common/dapps/surge/schemas';
import { isSurgeComponent } from '../../surge/surgeComponentAddressService';
import type { TransformedEvent } from '../../transaction-stream/transformEvent';
import {
  type CapturedEvent,
  createEventMatcher,
  parseEventData,
} from './createEventMatcher';

export type SurgeAccountCreationEvent = {
  readonly type: 'EventAccountCreation';
  data: EventAccountCreationType;
};

export type SurgeMarginOrderEvent = {
  readonly type: 'EventMarginOrder';
  data: EventMarginOrderType;
};

export type SurgeLiquidateEvent = {
  readonly type: 'EventLiquidate';
  data: EventLiquidateType;
};

export type SurgeAutoDeleverageEvent = {
  readonly type: 'EventAutoDeleverage';
  data: EventAutoDeleverageType;
};

export type SurgeSignalUpgradeEvent = {
  readonly type: 'EventSignalUpgrade';
  data: EventSignalUpgradeType;
};

export type SurgeAddCollateralEvent = {
  readonly type: 'EventAddCollateral';
  data: EventAddCollateralType;
};

export type SurgeRemoveCollateralEvent = {
  readonly type: 'EventRemoveCollateral';
  data: EventRemoveCollateralType;
};

export type SurgeEmittableEvents =
  | SurgeAccountCreationEvent
  | SurgeMarginOrderEvent
  | SurgeLiquidateEvent
  | SurgeAutoDeleverageEvent
  | SurgeSignalUpgradeEvent
  | SurgeAddCollateralEvent
  | SurgeRemoveCollateralEvent;

export type CapturedSurgeEvent = CapturedEvent<SurgeEmittableEvents>;

export const surgeEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    if (!isSurgeComponent(input.emitter.globalEmitter)) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case 'EventAccountCreation':
        return yield* parseEventData(input, EventAccountCreation);
      case 'EventMarginOrder':
        return yield* parseEventData(input, EventMarginOrder);
      case 'EventLiquidate':
        return yield* parseEventData(input, EventLiquidate);
      case 'EventAutoDeleverage':
        return yield* parseEventData(input, EventAutoDeleverage);
      case 'EventSignalUpgrade':
        return yield* parseEventData(input, EventSignalUpgrade);
      case 'EventAddCollateral':
        return yield* parseEventData(input, EventAddCollateral);
      case 'EventRemoveCollateral':
        return yield* parseEventData(input, EventRemoveCollateral);
      case 'EventPairUpdates':
      case 'EventCollateralConfigRemoval':
      case 'EventCollateralConfigUpdates':
      case 'EventExchangeConfigUpdate':
      case 'EventPairConfigUpdates':
      case 'EventValidRequestsStart':
      case 'EventRequests':
      case 'EventSwapDebt':
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(`No match found for event: surge.${input?.event.name}`);

    return yield* Effect.succeed(null);
  });

export const surgeEventMatcher = createEventMatcher(
  {
    dApp: 'Surge',
    category: 'Trading',
  },
  surgeEventMatcherFn,
);
