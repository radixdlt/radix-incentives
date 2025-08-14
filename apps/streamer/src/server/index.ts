import { serve } from '@hono/node-server';
import { setTransactionStreamStateProgram } from 'api/incentives';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';

const app = new Hono();

app.get('/health', (c) => {
  return c.text('ok');
});

app.post('/state', async (c) => {
  const { state } = await c.req.json();
  await setTransactionStreamStateProgram(state);
  return c.json({
    message: 'State updated',
    state,
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
