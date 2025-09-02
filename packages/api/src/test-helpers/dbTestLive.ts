import { inject } from '@effect/vitest';
import { schema } from 'db/incentives';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createDbClientLive } from '../incentives';

// @ts-ignore
const dbUrl = inject('testDbUrl');
export const dbTestClient = drizzle(postgres(dbUrl), { schema });
export const dbTestLive = createDbClientLive(dbTestClient);
