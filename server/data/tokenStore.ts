import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis'
import { MemoryStore, type SessionData } from 'express-session'
import { createRedisClient } from './redisClient'
import config from '../config'

type Client = RedisClientType<RedisModules, RedisFunctions, RedisScripts>
type StoreSession = { token: string; expiresAt: number }

export default class TokenStore {
  private client: Client | null

  private prefix = 'systemToken:'

  private useRedis: boolean

  private memStore: MemoryStore | null

  constructor(redisClient?: Client) {
    const redisEnabled = !!config.redis?.enabled
    this.useRedis = !!redisClient || redisEnabled
    this.client = this.useRedis ? (redisClient ?? (createRedisClient() as Client)) : null
    this.memStore = this.useRedis ? null : new MemoryStore()
  }

  private async ensureConnected() {
    if (!this.useRedis) return
    if (!this.client) throw new Error('Redis client not initialised')
    if (!this.client.isOpen) await this.client.connect()
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    if (this.useRedis) {
      await this.ensureConnected()
      await this.client!.set(`${this.prefix}${key}`, token, { EX: durationSeconds })
      return
    }

    const sid = `${this.prefix}${key}`
    const value: StoreSession = {
      token,
      expiresAt: Date.now() + durationSeconds * 1000,
    }

    await new Promise<void>((resolve, reject) => {
      this.memStore!.set(sid, value as unknown as SessionData, err => (err ? reject(err) : resolve()))
    })
  }

  public async getToken(key: string): Promise<string | null> {
    if (this.useRedis) {
      await this.ensureConnected()
      return (await this.client!.get(`${this.prefix}${key}`)) as string | null
    }

    const sid = `${this.prefix}${key}`
    const data = await new Promise<StoreSession | null>((resolve, reject) => {
      this.memStore!.get(sid, (err, sess) => {
        if (err) {
          reject(err)
        } else {
          resolve((sess as unknown as StoreSession) ?? null)
        }
      })
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
