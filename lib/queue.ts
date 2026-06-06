import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const promptQueue = new Queue("prompt-runs", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const generateQueue = new Queue("generate-prompts", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const cronQueue = new Queue("cron-jobs", {
  connection,
  defaultJobOptions: {
    attempts: 3,
  },
});

// Setup repeatable job for daily checks (running every day at midnight)
if (typeof window === "undefined") {
  cronQueue.add(
    "daily-checks",
    {},
    {
      repeat: {
        pattern: "0 0 * * *", // midnight
      },
      jobId: "daily-checks-repeat",
    }
  ).catch((err) => {
    console.error("[Queue] Failed to register repeatable daily-checks:", err);
  });
}

export { connection };

