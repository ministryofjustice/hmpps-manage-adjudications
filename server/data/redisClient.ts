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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public async set(key: string, value: string, options?: any): Promise<void> {
    await this.client.set(this.prefix + key, value, options)
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

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
  const client: RedisClient = createClient({
    url,
    password: config.redis.password,
    socket: {
      reconnectStrategy: (attempts: number) => {
        // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
        const nextDelay = Math.min(2 ** attempts * 20, 30000)
        logger.info(`Retry Redis connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`)
        return nextDelay
      },
    },
  })

  client.on('error', (e: Error) => logger.error('Redis client error', e))

  client.connect().catch((e: Error) => logger.error('Failed to connect to Redis', e))

  return new RedisClientWithPrefix(client, 'systemToken:')
}
