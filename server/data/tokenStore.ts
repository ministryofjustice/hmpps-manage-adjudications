import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis'
import { createRedisClient } from './redisClient'

type Client = RedisClientType<RedisModules, RedisFunctions, RedisScripts>

export default class TokenStore {
  private client: Client

  private prefix = 'systemToken:'

  constructor(redisClient: Client = createRedisClient() as Client) {
    this.client = redisClient
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${key}`, token, { EX: durationSeconds })
  }

  public async getToken(key: string): Promise<string | null> {
    await this.ensureConnected()
    return (await this.client.get(`${this.prefix}${key}`)) as string | null
  }
}
