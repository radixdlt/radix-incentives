import Redis from "ioredis";

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT
    ? Number.parseInt(process.env.REDIS_PORT, 10)
    : 6379,
  maxRetriesPerRequest: null,
});
