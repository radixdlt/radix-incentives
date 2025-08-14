import { serve } from '@hono/node-server';
import {
  setTransactionStreamStateProgram,
  setTransactionStreamStateVersionProgram,
  waitForStateChangeProgram,
} from 'api/incentives';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';

const app = new Hono();

app.get('/health', (c) => {
  return c.text('ok');
});

const ALLOWED_STATES = ['PAUSE', 'START'];

app.post('/state', async (c) => {
  const { state } = await c.req.json();

  if (!ALLOWED_STATES.includes(state)) {
    return c.json(
      {
        message: `Invalid input state: ${state}`,
        allowedStates: ALLOWED_STATES,
      },
      400,
    );
  }

  const input = state === 'PAUSE' ? 'PAUSING' : 'STARTING';
  const expectedState = state === 'PAUSE' ? 'PAUSED' : 'RUNNING';

  await setTransactionStreamStateProgram(input);
  await waitForStateChangeProgram(expectedState);
  return c.json({
    message: 'State updated',
    state: expectedState,
  });
});

app.post('/state-version', async (c) => {
  const { stateVersion } = await c.req.json();
  await setTransactionStreamStateVersionProgram(stateVersion);
  return c.json({
    message: 'State version updated',
    stateVersion,
  });
});

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3004;

console.log(`🚀 Starting server on port ${port}`);
console.log(`📍 Server will be available at: http://localhost:${port}`);

showRoutes(app);

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    console.log(`✅ Server is now running on http://localhost:${port}`);
  },
);

export default app;
