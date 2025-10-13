import { Effect } from 'effect';
import { isFluxComponent } from '../../../common/address-validation/addressValidation';
import {
  EventCloseCdp,
  EventLiquidateCdp,
  type EventMarkCdp,
  EventNewCdp,
  EventRedeemCdp,
  EventUpdateCdp,
  type StabilityPoolBuyEvent,
  type StabilityPoolContributionEvent,
  type StabilityPoolWithdrawalEvent,
} from '../../../common/dapps/flux/schemas';
import type { TransformedEvent } from '../../transaction-stream/transformEvent';
import {
  type CapturedEvent,
  createEventMatcher,
  parseEventData,
} from './createEventMatcher';

export type FluxEmittableEvents =
  | { readonly type: 'EventUpdateCdp'; data: EventUpdateCdp }
  | { readonly type: 'EventNewCdp'; data: EventNewCdp }
  | { readonly type: 'EventRedeemCdp'; data: EventRedeemCdp }
  | { readonly type: 'EventCloseCdp'; data: EventCloseCdp }
  | { readonly type: 'EventLiquidateCdp'; data: EventLiquidateCdp }
  | { readonly type: 'EventMarkCdp'; data: EventMarkCdp }
  | {
      readonly type: 'StabilityPoolContributionEvent';
      data: StabilityPoolContributionEvent;
    }
  | { readonly type: 'StabilityPoolBuyEvent'; data: StabilityPoolBuyEvent }
  | {
      readonly type: 'StabilityPoolWithdrawalEvent';
      data: StabilityPoolWithdrawalEvent;
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
        // These events don't trigger snapshots due to NFT updates, so we return null
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
