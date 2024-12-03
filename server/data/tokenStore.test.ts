import { RedisClientType } from 'redis'
import TokenStore from './tokenStore'

const createMockRedisClient = (): jest.Mocked<RedisClientType<any, any, any>> =>
  ({
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  }) as unknown as jest.Mocked<RedisClientType<any, any, any>>

describe('tokenStore', () => {
  let redisClient: jest.Mocked<RedisClientType<any, any, any>>
  let tokenStore: TokenStore

  beforeEach(() => {
    redisClient = createMockRedisClient()
    tokenStore = new TokenStore(redisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can retrieve token', async () => {
    redisClient.get.mockResolvedValueOnce('token-1')

    await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')
    expect(redisClient.get).toHaveBeenCalledWith('user-1')
  })

  it('Can set token', async () => {
    redisClient.set.mockResolvedValueOnce('OK')

    await tokenStore.setToken('user-1', 'token-1', 10)
    expect(redisClient.set).toHaveBeenCalledWith('user-1', 'token-1', { EX: 10 })
  })
})
