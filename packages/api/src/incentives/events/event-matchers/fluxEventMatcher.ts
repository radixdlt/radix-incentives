import { Effect } from 'effect';
import { isFluxComponent } from '../../../common/address-validation/addressValidation';
import {
  EventCloseCdp,
  type EventCloseCdp as EventCloseCdpType,
  EventLiquidateCdp,
  type EventLiquidateCdp as EventLiquidateCdpType,
  EventMarkCdp,
  type EventMarkCdp as EventMarkCdpType,
  EventNewCdp,
  type EventNewCdp as EventNewCdpType,
  EventRedeemCdp,
  type EventRedeemCdp as EventRedeemCdpType,
  EventUpdateCdp,
  type EventUpdateCdp as EventUpdateCdpType,
  type StabilityPoolBuyEvent as StabilityPoolBuyEventType,
  type StabilityPoolContributionEvent as StabilityPoolContributionEventType,
  type StabilityPoolWithdrawalEvent as StabilityPoolWithdrawalEventType,
} from '../../../common/dapps/flux/schemas';
import type { TransformedEvent } from '../../transaction-stream/transformEvent';
import {
  type CapturedEvent,
  createEventMatcher,
  parseEventData,
} from './createEventMatcher';

export type FluxEmittableEvents =
  | { readonly type: 'EventUpdateCdp'; data: EventUpdateCdpType }
  | { readonly type: 'EventNewCdp'; data: EventNewCdpType }
  | { readonly type: 'EventRedeemCdp'; data: EventRedeemCdpType }
  | { readonly type: 'EventCloseCdp'; data: EventCloseCdpType }
  | { readonly type: 'EventLiquidateCdp'; data: EventLiquidateCdpType }
  | { readonly type: 'EventMarkCdp'; data: EventMarkCdpType }
  | {
      readonly type: 'StabilityPoolContributionEvent';
      data: StabilityPoolContributionEventType;
    }
  | { readonly type: 'StabilityPoolBuyEvent'; data: StabilityPoolBuyEventType }
  | {
      readonly type: 'StabilityPoolWithdrawalEvent';
      data: StabilityPoolWithdrawalEventType;
    };

export type CapturedFluxEvent = CapturedEvent<FluxEmittableEvents>;

export const fluxEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    if (!isFluxComponent(input.emitter.globalEmitter, input.package.address)) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case 'EventUpdateCdp':
        return yield* parseEventData(input, EventUpdateCdp);
      case 'EventNewCdp':
        return yield* parseEventData(input, EventNewCdp);
      case 'EventRedeemCdp':
        return yield* parseEventData(input, EventRedeemCdp);
      case 'EventCloseCdp':
        return yield* parseEventData(input, EventCloseCdp);
      case 'EventLiquidateCdp':
        return yield* parseEventData(input, EventLiquidateCdp);
      case 'EventMarkCdp':
      case 'StabilityPoolContributionEvent':
      case 'StabilityPoolBuyEvent':
      case 'StabilityPoolWithdrawalEvent':
      case 'PanicModeChangeEvent':
      case 'PayoutFetchRewardsEvent':
      case 'PayoutClaimEvent':
      case 'PayoutRequirementUpdateEvent':
      case 'PanicModeLiquidationEvent':
      case 'EventAddCollateral':
      case 'EventChangeCollateral':
      case 'EventAddPoolCollateral':
      case 'EventChargeInterest':
        // These events don't trigger snapshots, so we return null
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(`No match found for event: flux.${input?.event.name}`);

    return yield* Effect.succeed(null);
  });

export const fluxEventMatcher = createEventMatcher(
  {
    dApp: 'Flux',
    category: 'Lending',
  },
  fluxEventMatcherFn,
);
