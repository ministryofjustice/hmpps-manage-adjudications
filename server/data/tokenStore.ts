import { promisify } from 'util'
import { createRedisClient, RedisClient } from './redisClient'

export default class TokenStore {
  private getRedisAsync: (key: string) => Promise<string>

  private setRedisAsync: (key: string, value: string, mode: string, durationSeconds: number) => Promise<void>

  constructor(redisClient: RedisClient = createRedisClient()) {
    this.getRedisAsync = promisify(redisClient.get).bind(redisClient)
    this.setRedisAsync = promisify(redisClient.set).bind(redisClient)
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    this.setRedisAsync(key, token, 'EX', durationSeconds)
  }

  public async getToken(key: string): Promise<string> {
    return this.getRedisAsync(key)
  }
}
