import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { HonoAdapter } from "@bull-board/hono";
import { createBullBoard } from "@bull-board/api";
import { serveStatic } from "@hono/node-server/serve-static";
import { snapshotQueue } from "../snapshot/queue";
import { scheduledSnapshotQueue } from "../scheduled-snapshot/queue";
import { showRoutes } from "hono/dev";
import { eventQueue } from "../event/queue";
import { eventQueueJobSchema } from "../event/schemas";
import { BullMQAdapter } from "@bull-board/api/dist/src/queueAdapters/bullMQ.js";
import { snapshotDateRangeQueue } from "../snapshot-date-range/queue";
import { snapshotDateRangeJobSchema } from "../snapshot-date-range/schemas";
import { calculateActivityPointsQueue } from "../calculate-activity-points/queue";
import { calculateActivityPointsJobSchema } from "../calculate-activity-points/schemas";
import { calculateSeasonPointsJobSchema } from "../calculate-season-points/schemas";
import { calculateSeasonPointsQueue } from "../calculate-season-points/queue";
import { seasonPointsMultiplierJobSchema } from "../calculate-season-points-multiplier/schemas";
import { seasonPointsMultiplierQueue } from "../calculate-season-points-multiplier/queue";

const app = new Hono();
const metricsApp = new Hono();

app.get("/health", (c) => {
  return c.text("ok");
});

metricsApp.get("/metrics", async (c) => {
  const snapshotQueueMetrics =
    await snapshotQueue.queue.exportPrometheusMetrics();
  const scheduledSnapshotQueueMetrics =
    await scheduledSnapshotQueue.queue.exportPrometheusMetrics();
  const eventQueueMetrics = await eventQueue.queue.exportPrometheusMetrics();
  const snapshotDateRangeQueueMetrics =
    await snapshotDateRangeQueue.queue.exportPrometheusMetrics();
  const calculateActivityPointsQueueMetrics =
    await calculateActivityPointsQueue.queue.exportPrometheusMetrics();
  return c.text(
    [
      snapshotQueueMetrics,
      scheduledSnapshotQueueMetrics,
      eventQueueMetrics,
      snapshotDateRangeQueueMetrics,
      calculateActivityPointsQueueMetrics
    ].join('\n')
  );
});

app.post("/queues/event/add", async (c) => {
  const input = await c.req.json();

  const parsedInput = eventQueueJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await eventQueue.queue.add("event", parsedInput.data);
  return c.text("ok");
});

app.post("/queues/snapshot-date-range/add", async (c) => {
  const input = await c.req.json();
  const parsedInput = snapshotDateRangeJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await snapshotDateRangeQueue.queue.add("snapshotDateRange", parsedInput.data);
  return c.text("ok");
});

app.post("/queues/calculate-activity-points/add", async (c) => {
  const input = await c.req.json();
  const parsedInput = calculateActivityPointsJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await calculateActivityPointsQueue.queue.add(
    "calculateActivityPoints",
    parsedInput.data
  );
  return c.text("ok");
});

app.post("/queues/calculate-season-points/add", async (c) => {
  const input = await c.req.json();
  const parsedInput = calculateSeasonPointsJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await calculateSeasonPointsQueue.queue.add(
    "calculateSeasonPoints",
    parsedInput.data
  );
  return c.text("ok");
});

app.post("/queues/calculate-season-points-multiplier/add", async (c) => {
  const input = await c.req.json();
  const parsedInput = seasonPointsMultiplierJobSchema.safeParse(input);
  if (!parsedInput.success) {
    return c.json({ error: parsedInput.error.message }, 400);
  }
  await seasonPointsMultiplierQueue.queue.add(
    "seasonPointsMultiplier",
    parsedInput.data
  );
  return c.text("ok");
});

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3003;
const metricsPort = process.env.METRICS_PORT ? Number.parseInt(process.env.METRICS_PORT) : 9210;

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
  ],
  serverAdapter,
});

const basePath = "/ui";
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
  }
);

serve(
  {
    fetch: metricsApp.fetch,
    port: metricsPort,
  },
  () => {
    console.log(`✅ Metrics server running on http://localhost:${metricsPort}/metrics`);
  }
);

showRoutes(app);

export default app;
