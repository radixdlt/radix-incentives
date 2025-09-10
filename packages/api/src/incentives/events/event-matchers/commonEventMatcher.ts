import { Effect } from 'effect';
import { isValidResourceAddress } from '../../../common/address-validation/addressValidation';
import type { TransformedEvent } from '../../transaction-stream/transformEvent';
import { type CapturedEvent, createEventMatcher } from './createEventMatcher';
import { parseDepositEvent } from './parseDepositEvent';
import { parseWithdrawEvent } from './parseWithdrawEvent';

export type CommonEmittableEvents =
  | {
      readonly type: 'WithdrawNonFungibleEvent';
      data: {
        resourceAddress: string;
        nftIds: string[];
        accountAddress: string;
      };
    }
  | {
      readonly type: 'DepositNonFungibleEvent';
      data: {
        resourceAddress: string;
        nftIds: string[];
        accountAddress: string;
      };
    }
  | {
      readonly type: 'WithdrawFungibleEvent';
      data: {
        resourceAddress: string;
        amount: string;
        accountAddress: string;
      };
    }
  | {
      readonly type: 'DepositFungibleEvent';
      data: {
        resourceAddress: string;
        amount: string;
        accountAddress: string;
      };
    }
  | { readonly type: 'SetRoleEvent'; data: Record<string, never> };

export type CapturedCommonEvent = CapturedEvent<CommonEmittableEvents>;

export const withdrawDepositEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    // Handle SetRoleEvent for margin account ownership tracking
    if (input?.event.name === 'SetRoleEvent') {
      return yield* Effect.succeed({
        globalEmitter: input.emitter.globalEmitter,
        packageAddress: input.package.address,
        blueprint: input.package.blueprint,
        eventName: input.event.name,
        eventData: {
          type: 'SetRoleEvent' as const,
          data: {},
        },
      });
    }

    const withdrawNonFungibleEventResult = parseWithdrawEvent(input, {
      isWhiteListedResourceAddress: isValidResourceAddress,
    });

    if (withdrawNonFungibleEventResult)
      return yield* Effect.succeed(withdrawNonFungibleEventResult);

    const depositEventResult = parseDepositEvent(input, {
      isWhiteListedResourceAddress: isValidResourceAddress,
    });

    if (depositEventResult) return yield* Effect.succeed(depositEventResult);

    return yield* Effect.succeed(null);
  });

export const commonEventMatcher = createEventMatcher(
  {
    dApp: 'Common',
    category: 'none',
  },
  withdrawDepositEventMatcherFn,
);
