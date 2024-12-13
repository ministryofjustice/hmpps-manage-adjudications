import { createClient } from 'redis'

import logger from '../../logger'
import config from '../config'

export type RedisClient = ReturnType<typeof createClient>

class RedisClientWithPrefix {
  private client: ReturnType<typeof createClient>

  private prefix: string

  constructor(client: ReturnType<typeof createClient>, prefix = 'systemToken:') {
    this.client = client
    this.prefix = prefix
  }

  public async set(key: string, value: string, options?: any): Promise<void> {
    await this.client.set(this.prefix + key, value, options)
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(this.prefix + key)
  }

  public async del(key: string): Promise<void> {
    await this.client.del(this.prefix + key)
  }

  public getOriginalClient() {
    return this.client
  }
}

const url =
  config.redis.tls_enabled === 'true'
    ? `rediss://${config.redis.host}:${config.redis.port}`
    : `redis://${config.redis.host}:${config.redis.port}`

export const createRedisClient = (): RedisClientWithPrefix => {
  const client = createClient({
    url,
    password: config.redis.password,
    socket: {
      tls: config.redis.tls_enabled === 'true',
    },
  })

  client.on('error', (e: Error) => logger.error('Redis client error', e))

  client.connect().catch((e: Error) => logger.error('Failed to connect to Redis', e))

  return new RedisClientWithPrefix(client, 'systemToken:')
}
