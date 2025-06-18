import type { WeftFinanceEmittableEvents } from "./weftFinanceEventMatcher";
import type { RootFinanceEmittableEvents } from "./rootFinanceEventMatcher";
import type { CaviarnineEmittableEvents } from "./caviarnineEventMatcher";
import type { CommonEmittableEvents } from "./commonEventMatcher";

export type EmittableEvent =
  | WeftFinanceEmittableEvents
  | RootFinanceEmittableEvents
  | CaviarnineEmittableEvents
  | CommonEmittableEvents;
