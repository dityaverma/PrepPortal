/**
 * BullMQ interface wrappers (placeholder).
 * Ready to be connected to actual bullmq library with redis.
 */
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
    
    // Simulate async background execution
    setTimeout(async () => {
      for (const handler of this.handlers) {
        try {
          await handler(job);
        } catch (err) {
          console.error(`[BullMQ Mock Queue: ${this.name}] Error processing job ${job.id}:`, err);
        }
      }
    }, 100);

    return job;
  }

  process(handler: (job: any) => Promise<void>): void {
    this.handlers.push(handler);
  }
}

export const createQueue = (name: string): IJobQueue => {
  return new MockJobQueue(name);
};
