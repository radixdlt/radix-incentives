import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import {
  adminAppRouter,
  createDependencyLayer,
  createTRPCContext,
} from 'api/incentives';
import { db } from 'db/incentives';
import type { NextRequest } from 'next/server';
import { env } from '~/env';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
    dependencyLayer: createDependencyLayer({
      dbClient: db,
    }),
    setSessionToken: async (_token: string, _expiresAt: Date) => {
      // TODO: Implement setSessionToken
    },
    getSessionToken: async () => {
      // TODO: Implement getSessionToken
      return null;
    },
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: adminAppRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
