import { createRedisClient } from './redisClient'

export default class TokenStore {
  private client

  private prefix = 'systemToken:'

  constructor(redisClient = createRedisClient()) {
    this.client = redisClient
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    // For redis v4, the expiration is set via an options object:
    await this.client.set(this.prefix + key, token, { EX: durationSeconds })
  }

  public async getToken(key: string): Promise<string | null> {
    return this.client.get(this.prefix + key)
  }
}
