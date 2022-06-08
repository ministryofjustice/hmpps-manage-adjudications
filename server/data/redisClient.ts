import { createClient } from 'redis'

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
