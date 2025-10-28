import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis'
import type TokenStoreClass from './tokenStore'

type Client = RedisClientType<RedisModules, RedisFunctions, RedisScripts>

function makeMockRedisClient(openAtStart = false) {
  let open = openAtStart
  const client = {
    get: jest.fn<Promise<string | null>, [string]>(),
    set: jest.fn<Promise<'OK'>, [string, string, { EX: number }]>(),
    connect: jest.fn(async () => {
      open = true
    }),
    quit: jest.fn(async () => {
      open = false
    }),
  } as unknown as Partial<Client> & { readonly isOpen: boolean }
  Object.defineProperty(client, 'isOpen', { get: () => open })
  return client as unknown as Client
}

describe('TokenStore', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('Redis mode', () => {
    let TokenStore: typeof TokenStoreClass
    let mockClient: Client

    beforeEach(async () => {
      mockClient = makeMockRedisClient(false)

      jest.doMock('../config', () => ({
        __esModule: true,
        default: { redis: { enabled: true } },
      }))
      jest.doMock('./redisClient', () => ({
        __esModule: true,
        createRedisClient: () => mockClient,
      }))

      await jest.isolateModulesAsync(async () => {
        const mod = await import('./tokenStore')
        TokenStore = mod.default
      })
    })

    it('getToken connects once and fetches namespaced key', async () => {
      const store = new TokenStore(mockClient)
      ;(mockClient.get as jest.Mock).mockResolvedValue('t-123')

      await expect(store.getToken('user-1')).resolves.toBe('t-123')
      expect(mockClient.connect).toHaveBeenCalledTimes(1)
      expect(mockClient.get).toHaveBeenCalledWith('systemToken:user-1')
    })

    it('setToken sets value with EX and connects once', async () => {
      const store = new TokenStore(mockClient)
      ;(mockClient.set as jest.Mock).mockResolvedValue('OK')

      await store.setToken('user-1', 'tok', 15)

      expect(mockClient.connect).toHaveBeenCalledTimes(1)
      expect(mockClient.set).toHaveBeenCalledWith('systemToken:user-1', 'tok', { EX: 15 })
    })

    it('does not call connect when client.isOpen is already true', async () => {
      mockClient = makeMockRedisClient(true)

      jest.doMock('./redisClient', () => ({
        __esModule: true,
        createRedisClient: () => mockClient,
      }))
      await jest.isolateModulesAsync(async () => {
        const mod = await import('./tokenStore')
        TokenStore = mod.default
      })

      const store = new TokenStore(mockClient)
      ;(mockClient.get as jest.Mock).mockResolvedValue('tok')

      await store.getToken('abc')

      expect(mockClient.connect).not.toHaveBeenCalled()
      expect(mockClient.get).toHaveBeenCalledWith('systemToken:abc')
    })
  })

  describe('Memory mode', () => {
    let TokenStore: typeof TokenStoreClass

    beforeEach(async () => {
      jest.doMock('../config', () => ({
        __esModule: true,
        default: { redis: { enabled: false } },
      }))

      await jest.isolateModulesAsync(async () => {
        const mod = await import('./tokenStore')
        TokenStore = mod.default
      })
    })

    it('setToken then getToken returns the token', async () => {
      const store = new TokenStore()

      await store.setToken('k1', 'v1', 5)
      await expect(store.getToken('k1')).resolves.toBe('v1')
    })

    it('expired tokens return null and are destroyed on read', async () => {
      const store = new TokenStore()
      await store.setToken('k2', 'v2', 1)

      const realNow = Date.now
      const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => realNow() + 10_000)

      await expect(store.getToken('k2')).resolves.toBeNull()
      await expect(store.getToken('k2')).resolves.toBeNull()

      nowSpy.mockRestore()
    })

    it('never calls any redis client methods when disabled', async () => {
      const mockClient = makeMockRedisClient(false)

      jest.doMock('./redisClient', () => ({
        __esModule: true,
        createRedisClient: () => mockClient,
      }))
      await jest.isolateModulesAsync(async () => {
        const mod = await import('./tokenStore')
        TokenStore = mod.default
      })

      const store = new TokenStore()
      await store.setToken('k3', 'v3', 2)
      await store.getToken('k3')

      expect(mockClient.connect as jest.Mock).not.toHaveBeenCalled()
      expect(mockClient.get as jest.Mock).not.toHaveBeenCalled()
      expect(mockClient.set as jest.Mock).not.toHaveBeenCalled()
    })
  })
})
