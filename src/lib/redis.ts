import Redis from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";

export interface IRedisService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

class MockRedisService implements IRedisService {
  private store = new Map<string, { value: string; expiry: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }
}

class RealRedisService implements IRedisService {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    this.client.on("error", (err) => {
      console.error("[redis] connection error:", err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, "EX", ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const res = await this.client.exists(key);
    return res === 1;
  }
}

class UpstashRedisService implements IRedisService {
  private client: UpstashRedis;

  constructor(url: string, token: string) {
    this.client = new UpstashRedis({
      url,
      token,
    });
  }

  async get(key: string): Promise<string | null> {
    const res = await this.client.get<string>(key);
    if (res === undefined || res === null) return null;
    return typeof res === "string" ? res : JSON.stringify(res);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, { ex: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const res = await this.client.exists(key);
    return res === 1;
  }
}

const useMock = process.env.NODE_ENV === "test" || 
  (!process.env.UPSTASH_REDIS_REST_URL && !process.env.REDIS_URL);

let serviceInstance: IRedisService;

if (useMock) {
  serviceInstance = new MockRedisService();
} else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.log("[redis] Connecting to Upstash REST Redis...");
  serviceInstance = new UpstashRedisService(
    process.env.UPSTASH_REDIS_REST_URL,
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
} else {
  console.log("[redis] Connecting to standard TCP Redis...");
  serviceInstance = new RealRedisService(process.env.REDIS_URL!);
}

export const redisService = serviceInstance;
export default redisService;
