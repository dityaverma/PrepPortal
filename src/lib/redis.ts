/**
 * Redis interface wrapper (placeholder).
 * Ready to be replaced by dynamic ioredis or redis client.
 */
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

export const redisService = new MockRedisService();
export default redisService;
