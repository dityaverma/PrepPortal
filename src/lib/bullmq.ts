import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

export interface IJobQueue<T = any> {
  add(name: string, data: T, opts?: any): Promise<any>;
  process(handler: (job: any) => Promise<void>): void;
}

class MockJobQueue<T = any> implements IJobQueue<T> {
  private name: string;
  private handlers: ((job: any) => Promise<void>)[] = [];

  constructor(name: string) {
    this.name = name;
  }

  async add(name: string, data: T, opts?: any): Promise<any> {
    const job = { id: Math.random().toString(), name, data, opts, createdAt: new Date() };
    console.log(`[BullMQ Mock Queue: ${this.name}] Added job:`, job);
    
    const runHandlers = async () => {
      for (const handler of this.handlers) {
        try {
          await handler(job);
        } catch (err) {
          console.error(`[BullMQ Mock Queue: ${this.name}] Error processing job ${job.id}:`, err);
        }
      }
    };

    if (process.env.NODE_ENV === "test") {
      await runHandlers();
    } else {
      setTimeout(runHandlers, 100);
    }

    return job;
  }

  process(handler: (job: any) => Promise<void>): void {
    this.handlers.push(handler);
  }
}

class RealJobQueue<T = any> implements IJobQueue<T> {
  private name: string;
  private queue: Queue;
  private connection: Redis;
  private workers: Worker[] = [];

  constructor(name: string, redisUrl: string) {
    this.name = name;
    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    this.queue = new Queue(name, { connection: this.connection as any });
  }

  async add(name: string, data: T, opts?: any): Promise<any> {
    return this.queue.add(name, data, opts);
  }

  process(handler: (job: any) => Promise<void>): void {
    const worker = new Worker(
      this.name,
      async (job) => {
        await handler(job);
      },
      { connection: this.connection as any }
    );

    worker.on("error", (err) => {
      console.error(`[bullmq] worker error on queue ${this.name}:`, err);
    });

    this.workers.push(worker);
  }
}

const useMock = process.env.NODE_ENV === "test" || !process.env.REDIS_URL;

export const createQueue = (name: string): IJobQueue => {
  return useMock
    ? new MockJobQueue(name)
    : new RealJobQueue(name, process.env.REDIS_URL!);
};
