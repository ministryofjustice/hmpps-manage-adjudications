import { createRedisClient, RedisClient } from './redisClient'

export default class TokenStore {
  private redisClient: RedisClient

  constructor(redisClient: RedisClient = createRedisClient()) {
    this.redisClient = redisClient
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.redisClient.set(key, token, { EX: durationSeconds })
  }

  public async getToken(key: string): Promise<string | null> {
    return this.redisClient.get(key)
  }
}
