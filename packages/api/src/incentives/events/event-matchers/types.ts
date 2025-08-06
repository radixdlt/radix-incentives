import type { CaviarnineEmittableEvents } from './caviarnineEventMatcher';
import type { CommonEmittableEvents } from './commonEventMatcher';
import type { DefiPlazaEmittableEvents } from './defiPlazaEventMatcher';
import type { HLPEmittableEvents } from './hlpEventMatcher';
import type { OciswapEmittableEvents } from './ociswapEventMatcher';
import type { RootFinanceEmittableEvents } from './rootFinanceEventMatcher';
import type { WeftFinanceEmittableEvents } from './weftFinanceEventMatcher';

export type EmittableEvent =
  | CommonEmittableEvents
  | WeftFinanceEmittableEvents
  | RootFinanceEmittableEvents
  | CaviarnineEmittableEvents
  | DefiPlazaEmittableEvents
  | HLPEmittableEvents
  | OciswapEmittableEvents;
