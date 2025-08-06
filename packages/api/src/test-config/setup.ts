// Polyfill fetch for Node.js environment
import { Headers, Request, Response, fetch } from 'undici';

if (!globalThis.fetch) {
  globalThis.fetch = fetch as typeof globalThis.fetch;
  globalThis.Headers = Headers as typeof globalThis.Headers;
  globalThis.Request = Request as typeof globalThis.Request;
  globalThis.Response = Response as typeof globalThis.Response;
}
