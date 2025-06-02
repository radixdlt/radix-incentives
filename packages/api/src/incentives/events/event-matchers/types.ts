import type { WeftFinanceEmittableEvents } from "./weftFinanceEventMatcher";
import type { CaviarnineEmittableEvents } from "./caviarnineEventMatcher";

export type EmittableEvent =
  | WeftFinanceEmittableEvents
  | CaviarnineEmittableEvents;
