import type { WeftFinanceEmittableEvents } from "./weftFinanceEventMatcher";
import type { CaviarnineEmittableEvents } from "./caviarnineEventMatcher";
import type { CommonEmittableEvents } from "./commonEventMatcher";

export type EmittableEvent =
  | WeftFinanceEmittableEvents
  | CaviarnineEmittableEvents
  | CommonEmittableEvents;
