import { createClient, RedisClientType } from 'redis'
import logger from '../../logger'
import config from '../config'

export type RedisClient = RedisClientType<Record<string, never>, Record<string, never>, Record<string, never>>

export const createRedisClient = (): RedisClient => {
  const PREFIX = 'systemToken:'

  const client: RedisClient = createClient({
    url: `redis://${config.redis.host}:${config.redis.port}`,
    password: config.redis.password,
    socket: {
      tls: config.redis.tls_enabled === 'true',
    },
  })

  client.on('error', (e: Error) => logger.error('Redis client error', e))

  const wrapWithPrefix = (command: 'get' | 'set' | 'del' | 'exists' | 'keys', key: string, ...args: unknown[]) => {
    if (typeof key !== 'string') {
      throw new Error(`Key must be a string, received ${typeof key}`)
    }
    const prefixedKey = `${PREFIX}${key}`
    return (client as any)[command](prefixedKey, ...args)
  }

  const proxyClient = new Proxy(client, {
    get(target, prop: string) {
      if (['get', 'set', 'del', 'exists', 'keys'].includes(prop)) {
        return async (key: string, ...args: unknown[]) => {
          try {
            return await wrapWithPrefix(prop as 'get' | 'set' | 'del' | 'exists' | 'keys', key, ...args)
          } catch (error) {
            logger.error(`Error executing Redis command ${prop}`, error)
            throw error
          }
        }
      }
      return target[prop as keyof RedisClient]
    },
  })

  return proxyClient as RedisClient
}
