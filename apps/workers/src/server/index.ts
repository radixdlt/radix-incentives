import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/dist/src/queueAdapters/bullMQ.js';
import { HonoAdapter } from '@bull-board/hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import {
  seasonPointsMultiplierJobSchema,
  snapshotDateRangeJobSchema,
} from 'api/incentives';
import { SeasonRewardWorkerInputSchema } from 'api/incentives/season-reward/seasonRewardWorker';
import { Schema } from 'effect';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { calculateActivityPointsQueue } from '../queues/calculate-activity-points/queue';
import { calculateActivityPointsJobSchema } from '../queues/calculate-activity-points/schemas';
import { calculateSeasonPointsQueue } from '../queues/calculate-season-points/queue';
import { calculateSeasonPointsJobSchema } from '../queues/calculate-season-points/schemas';
import { seasonPointsMultiplierQueue } from '../queues/calculate-season-points-multiplier/queue';
import { eventQueue } from '../queues/event/queue';
import { eventQueueJobSchema } from '../queues/event/schemas';
import { maintenanceQueue } from '../queues/maintenance/queue';
import { populateLeaderboardCacheQueue } from '../queues/populate-leaderboard-cache/queue';
import { populateLeaderboardCacheSchema } from '../queues/populate-leaderboard-cache/schemas';
import { processWeekQueue } from '../queues/process-week/queue';
import { ProcessWeekJobSchema } from '../queues/process-week/schemas';
import { scheduledCalculationsQueue } from '../queues/scheduled-calculations/queue';
import { seasonRewardClaimQueue } from '../queues/season-reward-claim/queue';
import { snapshotQueue } from '../queues/snapshot/queue';
import { snapshotJobSchema } from '../queues/snapshot/schemas';
import { snapshotDateRangeQueue } from '../queues/snapshot-date-range/queue';
import { vesterRefillQueue } from '../queues/vester-refill/queue';

const app = new Hono();
const metricsApp = new Hono();

app.get('/health', (c) => {
  return c.text('ok');
});

metricsApp.get('/metrics', async (c) => {
  const snapshotQueueMetrics =
    await snapshotQueue.queue.exportPrometheusMetrics();
  const eventQueueMetrics = await eventQueue.queue.exportPrometheusMetrics();
  const snapshotDateRangeQueueMetrics =
    await snapshotDateRangeQueue.queue.exportPrometheusMetrics();
  const calculateActivityPointsQueueMetrics =
    await calculateActivityPointsQueue.queue.exportPrometheusMetrics();
  const scheduledCalculationsQueueMetrics =
    await scheduledCalculationsQueue.queue.exportPrometheusMetrics();
  const populateLeaderboardCacheQueueMetrics =
    await populateLeaderboardCacheQueue.queue.exportPrometheusMetrics();
  const processWeekQueueMetrics =
    await processWeekQueue.queue.exportPrometheusMetrics();
  const maintenanceQueueMetrics =
    await maintenanceQueue.queue.exportPrometheusMetrics();
  const seasonRewardClaimQueueMetrics =
    await seasonRewardClaimQueue.queue.exportPrometheusMetrics();
  const vesterRefillQueueMetrics =
    await vesterRefillQueue.queue.exportPrometheusMetrics();
  return c.text(
    [
      snapshotQueueMetrics,
      eventQueueMetrics,
      snapshotDateRangeQueueMetrics,
      calculateActivityPointsQueueMetrics,
      scheduledCalculationsQueueMetrics,
      populateLeaderboardCacheQueueMetrics,
      processWeekQueueMetrics,
      maintenanceQueueMetrics,
      seasonRewardClaimQueueMetrics,
      vesterRefillQueueMetrics,
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

app.post('/queues/process-week/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = ProcessWeekJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await processWeekQueue.queue.add('process-week', parsedInput.data);
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

app.post('/queues/maintenance/add', async (c) => {
  await maintenanceQueue.queue.add('maintenance', {});
  return c.text('ok');
});

app.post('/queues/season-reward-claim/add', async (c) => {
  const input = await c.req.json();
  const parsedInput = Schema.decodeUnknownSync(SeasonRewardWorkerInputSchema)(
    input,
  );
  await seasonRewardClaimQueue.queue.add('seasonRewardClaim', parsedInput);
  return c.text('ok');
});

app.post('/queues/vester-refill/add', async (c) => {
  await vesterRefillQueue.queue.add('vesterRefill', {});
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
    new BullMQAdapter(eventQueue.queue),
    new BullMQAdapter(snapshotDateRangeQueue.queue),
    new BullMQAdapter(calculateActivityPointsQueue.queue),
    new BullMQAdapter(calculateSeasonPointsQueue.queue),
    new BullMQAdapter(seasonPointsMultiplierQueue.queue),
    new BullMQAdapter(scheduledCalculationsQueue.queue),
    new BullMQAdapter(populateLeaderboardCacheQueue.queue),
    new BullMQAdapter(processWeekQueue.queue),
    new BullMQAdapter(maintenanceQueue.queue),
    new BullMQAdapter(seasonRewardClaimQueue.queue),
    new BullMQAdapter(vesterRefillQueue.queue),
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
