import Redis from "ioredis"

export const redis = new Redis({
  host      : process.env.REDIS_HOST          || "127.0.0.1",
  port      : Number(process.env.REDIS_PORT)  || 6379,
  password  : process.env.REDIS_PASSWORD      || undefined,
  db        : Number(process.env.REDIS_DB)    || 0,
})


export const cache = {
  makeKey(type: string, prefix: string, query: any): string {
    const keyParts = typeof query === "object" ? JSON.stringify(query) : String(query);
    return `${type}:${prefix}:${Buffer.from(keyParts).toString("base64")}`;
  },
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: any, expired: number): Promise<void> {
    const ttl = expired ?? 60; 
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  },

  async clear(type: string, prefix: string) {
    const keyPrefix = `${type}:${prefix}:*`
    const keys = await redis.keys(keyPrefix)
    if (keys.length) await redis.del(keys)
  }
}