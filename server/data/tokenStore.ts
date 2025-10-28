import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis'
import session from 'express-session'
import { createRedisClient } from './redisClient'
import config from '../config'

type Client = RedisClientType<RedisModules, RedisFunctions, RedisScripts>
type Stored = { token: string; expiresAt: number }

export default class TokenStore {
  private client: Client | null

  private memStore: session.MemoryStore | null

  private useRedis: boolean

  private prefix = 'systemToken:'

  constructor(redisClient: Client = createRedisClient() as Client) {
    const redisEnabled = !!config.redis?.enabled
    this.useRedis = redisEnabled
    this.client = redisEnabled ? redisClient : null
    this.memStore = redisEnabled ? null : new session.MemoryStore()
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

    const value: Stored = { token, expiresAt: Date.now() + durationSeconds * 1000 }
    await new Promise<void>((resolve, reject) => {
      this.memStore!.set(sid, value as unknown as session.SessionData, err => (err ? reject(err) : resolve()))
    })
  }

  public async getToken(key: string): Promise<string | null> {
    const sid = `${this.prefix}${key}`

    if (this.useRedis) {
      await this.ensureConnected()
      return (await this.client!.get(sid)) as string | null
    }

    const data = await new Promise<Stored | null>((resolve, reject) => {
      this.memStore!.get(sid, (err, sess) => (err ? reject(err) : resolve((sess as unknown as Stored) ?? null)))
    })

    if (!data) return null
    if (Date.now() >= data.expiresAt) {
      await new Promise<void>(resolve => {
        this.memStore!.destroy(sid, () => resolve())
      })
      return null
    }
    return data.token
  }
}
