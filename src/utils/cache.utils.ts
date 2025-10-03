import Redis from "ioredis"

export const redis = new Redis({
  host      : process.env.REDIS_HOST          || "127.0.0.1",
  port      : Number(process.env.REDIS_PORT)  || 6379,
  password  : process.env.REDIS_PASSWORD      || undefined,
  db        : Number(process.env.REDIS_DB)    || 0,
})


export const cache = {
  async makeCacheKey(keyPrefix: string, db: any, method: string): Promise<string> {
    const sql = db.toSQL()
    return `db:${keyPrefix}:${method}:${sql.sql}:${JSON.stringify(sql.bindings)}`
  },

  async clearCache(keyPrefix: string) {
    const prefix = `db:${keyPrefix}:*`
    const keys = await redis.keys(prefix)
    if (keys.length) await redis.del(keys)
  }
}