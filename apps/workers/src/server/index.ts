import * as v8 from 'node:v8';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/dist/src/queueAdapters/bullMQ.js';
import { HonoAdapter } from '@bull-board/hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
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
import { snapshotDateRangeJobSchema } from '../queues/snapshot-date-range/schemas';

const app = new Hono();
const metricsApp = new Hono();

// --- Memory / Heap logging ---------------------------------------------------
const formatMb = (bytes: number): string => (bytes / 1024 / 1024).toFixed(2);

const logHeapUsage = (label?: string): void => {
  const mem = process.memoryUsage();
  // eslint-disable-next-line no-console
  console.log(
    `🧠 Heap${label ? ` (${label})` : ''}: used=${formatMb(mem.heapUsed)} MB, total=${formatMb(mem.heapTotal)} MB, rss=${formatMb(mem.rss)} MB, external=${formatMb(mem.external)} MB`,
  );
};

const getMaxOldSpaceFromArgv = (): number | undefined => {
  const arg = process.execArgv.find((a) =>
    a.startsWith('--max-old-space-size='),
  );
  if (!arg) return undefined;
  const value = Number.parseInt(arg.split('=')[1] ?? '', 10);
  return Number.isFinite(value) ? value : undefined;
};

const logHeapLimits = (): void => {
  const heapStats = v8.getHeapStatistics();
  const heapLimitMb = Number.parseInt(formatMb(heapStats.heap_size_limit), 10);
  const argvOldSpaceMb = getMaxOldSpaceFromArgv();
  const envOldSpaceMb = process.env.NODE_MAX_OLD_SPACE_SIZE
    ? Number.parseInt(process.env.NODE_MAX_OLD_SPACE_SIZE, 10)
    : undefined;
  // eslint-disable-next-line no-console
  console.log(
    `🧱 Heap limits: v8HeapLimit=${heapLimitMb} MB, argvMaxOldSpace=${argvOldSpaceMb ?? 'not set'} MB, env.NODE_MAX_OLD_SPACE_SIZE=${envOldSpaceMb ?? 'not set'} MB`,
  );
};

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
const heapLogIntervalMs = process.env.HEAP_LOG_INTERVAL_MS
  ? Number.parseInt(process.env.HEAP_LOG_INTERVAL_MS)
  : undefined;

console.log(`🚀 Starting server on port ${port}`);
console.log(`📍 Server will be available at: http://localhost:${port}`);
logHeapLimits();
logHeapUsage('startup');

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

// Optional: periodic heap logging if env set
if (
  heapLogIntervalMs &&
  Number.isFinite(heapLogIntervalMs) &&
  heapLogIntervalMs > 0
) {
  setInterval(() => logHeapUsage('interval'), heapLogIntervalMs).unref();
}

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
