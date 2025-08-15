import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/dist/src/queueAdapters/bullMQ.js';
import { HonoAdapter } from '@bull-board/hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { snapshotDateRangeJobSchema } from 'api/incentives';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { calculateActivityPointsQueue } from '../queues/calculate-activity-points/queue';
import { calculateActivityPointsJobSchema } from '../queues/calculate-activity-points/schemas';
import { calculateSeasonPointsQueue } from '../queues/calculate-season-points/queue';
import { calculateSeasonPointsJobSchema } from '../queues/calculate-season-points/schemas';
import { seasonPointsMultiplierQueue } from '../queues/calculate-season-points-multiplier/queue';
import { seasonPointsMultiplierJobSchema } from '../queues/calculate-season-points-multiplier/schemas';
import { eventQueue } from '../queues/event/queue';
import { eventQueueJobSchema } from '../queues/event/schemas';
import { populateLeaderboardCacheQueue } from '../queues/populate-leaderboard-cache/queue';
import { populateLeaderboardCacheSchema } from '../queues/populate-leaderboard-cache/schemas';
import { scheduledCalculationsQueue } from '../queues/scheduled-calculations/queue';
import { scheduledSnapshotQueue } from '../queues/scheduled-snapshot/queue';
import { snapshotQueue } from '../queues/snapshot/queue';
import { snapshotJobSchema } from '../queues/snapshot/schemas';
import { snapshotDateRangeQueue } from '../queues/snapshot-date-range/queue';

const app = new Hono();
const metricsApp = new Hono();

app.get('/health', (c) => {
  return c.text('ok');
});

metricsApp.get('/metrics', async (c) => {
  const snapshotQueueMetrics =
    await snapshotQueue.queue.exportPrometheusMetrics();
  const scheduledSnapshotQueueMetrics =
    await scheduledSnapshotQueue.queue.exportPrometheusMetrics();
  const eventQueueMetrics = await eventQueue.queue.exportPrometheusMetrics();
  const snapshotDateRangeQueueMetrics =
    await snapshotDateRangeQueue.queue.exportPrometheusMetrics();
  const calculateActivityPointsQueueMetrics =
    await calculateActivityPointsQueue.queue.exportPrometheusMetrics();
  const scheduledCalculationsQueueMetrics =
    await scheduledCalculationsQueue.queue.exportPrometheusMetrics();
  const populateLeaderboardCacheQueueMetrics =
    await populateLeaderboardCacheQueue.queue.exportPrometheusMetrics();
  return c.text(
    [
      snapshotQueueMetrics,
      scheduledSnapshotQueueMetrics,
      eventQueueMetrics,
      snapshotDateRangeQueueMetrics,
      calculateActivityPointsQueueMetrics,
      scheduledCalculationsQueueMetrics,
      populateLeaderboardCacheQueueMetrics,
    ].join('\n'),
  );
});

app.post('/queues/event/add', async (c) => {
  const input = await c.req.json();

  const parsedInput = eventQueueJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await eventQueue.queue.add('event', parsedInput.data);
  return c.text('ok');
});

app.post('/queues/snapshot/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = snapshotJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await snapshotQueue.queue.add('snapshot', parsedInput.data);
  return c.text('ok');
});

app.post('/queues/snapshot-date-range/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = snapshotDateRangeJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await snapshotDateRangeQueue.queue.add('snapshotDateRange', parsedInput.data);
  return c.text('ok');
});

app.post('/queues/calculate-activity-points/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = calculateActivityPointsJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await calculateActivityPointsQueue.queue.add(
    'calculateActivityPoints',
    parsedInput.data,
  );
  return c.text('ok');
});

app.post('/queues/calculate-season-points/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = calculateSeasonPointsJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await calculateSeasonPointsQueue.queue.add(
    'calculateSeasonPoints',
    parsedInput.data,
  );
  return c.text('ok');
});

app.post('/queues/calculate-season-points-multiplier/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = seasonPointsMultiplierJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await seasonPointsMultiplierQueue.queue.add(
    'seasonPointsMultiplier',
    parsedInput.data,
  );
  return c.text('ok');
});

app.post('/queues/scheduled-calculations/add', async (c) => {
  const input = await c.req.json();
  await scheduledCalculationsQueue.queue.add('manual-trigger', input);
  return c.text('ok');
});

app.post('/queues/populate-leaderboard-cache/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = populateLeaderboardCacheSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await populateLeaderboardCacheQueue.queue.add(
    'populateLeaderboardCache',
    parsedInput.data,
  );
  return c.text('ok');
});

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3003;
const metricsPort = process.env.METRICS_PORT
  ? Number.parseInt(process.env.METRICS_PORT)
  : 9210;

console.log(`🚀 Starting server on port ${port}`);
console.log(`📍 Server will be available at: http://localhost:${port}`);

const serverAdapter = new HonoAdapter(serveStatic);

createBullBoard({
  queues: [
    new BullMQAdapter(snapshotQueue.queue),
    new BullMQAdapter(scheduledSnapshotQueue.queue),
    new BullMQAdapter(eventQueue.queue),
    new BullMQAdapter(snapshotDateRangeQueue.queue),
    new BullMQAdapter(calculateActivityPointsQueue.queue),
    new BullMQAdapter(calculateSeasonPointsQueue.queue),
    new BullMQAdapter(seasonPointsMultiplierQueue.queue),
    new BullMQAdapter(scheduledCalculationsQueue.queue),
    new BullMQAdapter(populateLeaderboardCacheQueue.queue),
  ],
  serverAdapter,
});

const basePath = '/ui';
serverAdapter.setBasePath(basePath);
app.route(basePath, serverAdapter.registerPlugin());

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

serve(
  {
    fetch: metricsApp.fetch,
    port: metricsPort,
  },
  () => {
    console.log(
      `✅ Metrics server running on http://localhost:${metricsPort}/metrics`,
    );
  },
);

showRoutes(app);

export default app;
