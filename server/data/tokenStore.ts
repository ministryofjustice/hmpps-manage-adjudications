import { createClient } from 'redis'
import { promisify } from 'util'

import logger from '../../logger'
import config from '../config'

export type RedisClient = ReturnType<typeof createClient>

export const createRedisClient = (): RedisClient => {
  const client = createClient({
    port: config.redis.port,
    password: config.redis.password,
    host: config.redis.host,
    tls: config.redis.tls_enabled === 'true' ? {} : false,
    prefix: 'systemToken:',
  })
  client.on('error', (e: Error) => logger.error('Redis client error', e))
  return client
}

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
