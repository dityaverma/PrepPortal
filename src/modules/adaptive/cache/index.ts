import { redisService } from "@/lib/redis";

// cache manager handling prompts responses and quizzes via redis service
export class AdaptiveCache {
  private defaultTtl: number;

  constructor() {
    this.defaultTtl = Number(process.env.CACHE_TTL_SECONDS) || 3600;
  }

  // get cached value for a key
  async get(key: string): Promise<string | null> {
    return redisService.get(key);
  }

  // set key value with optional custom ttl
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds !== undefined ? ttlSeconds : this.defaultTtl;
    await redisService.set(key, value, ttl);
  }

  // delete key from store
  async delete(key: string): Promise<void> {
    await redisService.del(key);
  }

  // generate unique key from parts
  makeKey(...parts: string[]): string {
    return `adaptive:${parts.join(":")}`;
  }
}

export const adaptiveCache = new AdaptiveCache();
