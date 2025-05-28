import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { HonoAdapter } from "@bull-board/hono";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { serveStatic } from "@hono/node-server/serve-static";
import { snapshotQueue } from "../snapshot/queue";
import { scheduledSnapshotQueue } from "../scheduled-snapshot/queue";
import { showRoutes } from "hono/dev";

const app = new Hono();

app.get("/health", (c) => {
  return c.text("ok");
});

app.get("/metrics", async (c) => {
  const snapshotQueueMetrics =
    await snapshotQueue.queue.exportPrometheusMetrics();
  const scheduledSnapshotQueueMetrics =
    await scheduledSnapshotQueue.queue.exportPrometheusMetrics();
  return c.text("".concat(snapshotQueueMetrics, scheduledSnapshotQueueMetrics));
});

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3003;

console.log(`🚀 Starting server on port ${port}`);
console.log(`📍 Server will be available at: http://localhost:${port}`);

const serverAdapter = new HonoAdapter(serveStatic);

createBullBoard({
  queues: [
    new BullMQAdapter(snapshotQueue.queue),
    new BullMQAdapter(scheduledSnapshotQueue.queue),
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

showRoutes(app);

export default app;
