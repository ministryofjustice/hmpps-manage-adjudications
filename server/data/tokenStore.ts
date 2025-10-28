import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis'
import { createRedisClient } from './redisClient'
import config from '../config'
import { getMemoryStore, memGet, memSet, memDestroy } from './memoryStore'

type Client = RedisClientType<RedisModules, RedisFunctions, RedisScripts>
type StoreSession = { token: string; expiresAt: number }

export default class TokenStore {
  private client: Client | null

  private prefix = 'systemToken:'

  private useRedis: boolean

  constructor(redisClient?: Client) {
    const redisEnabled = !!config.redis?.enabled
    this.useRedis = !!redisClient || redisEnabled
    this.client = this.useRedis ? (redisClient ?? (createRedisClient() as Client)) : null
    if (!this.useRedis) getMemoryStore()
  }

  private async ensureConnected() {
    if (!this.useRedis) return
    if (!this.client) throw new Error('Redis client not initialised')
    if (!this.client.isOpen) await this.client.connect()
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    const sid = `${this.prefix}${key}`
    if (this.useRedis) {
      await this.ensureConnected()
      await this.client!.set(sid, token, { EX: durationSeconds })
      return
    }
    const value: StoreSession = {
      token,
      expiresAt: Date.now() + durationSeconds * 1000,
    }
    await memSet(sid, value)
  }

  public async getToken(key: string): Promise<string | null> {
    const sid = `${this.prefix}${key}`
    if (this.useRedis) {
      await this.ensureConnected()
      return (await this.client!.get(sid)) as string | null
    }
    const data = await memGet<StoreSession>(sid)
    if (!data) return null
    if (Date.now() >= data.expiresAt) {
      await memDestroy(sid)
      return null
    }
    return data.token
  }
}
