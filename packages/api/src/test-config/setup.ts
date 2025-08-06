// Polyfill fetch for Node.js environment
import { fetch, Headers, Request, Response } from 'undici';

if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
  globalThis.Headers = Headers as any;
  globalThis.Request = Request as any;
  globalThis.Response = Response as any;
}