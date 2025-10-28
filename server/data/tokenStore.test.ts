import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis'
import TokenStore from './tokenStore'

type Client = RedisClientType<RedisModules, RedisFunctions, RedisScripts>

// Build a minimal mock with a computed isOpen getter
function makeMockRedisClient() {
  let open = false

  const mock = {
    on: jest.fn(),
    get: jest.fn<Promise<string | null>, [string]>(),
    set: jest.fn<Promise<'OK'>, [string, string, { EX: number }]>(),
    connect: jest.fn(async () => {
      open = true
    }),
  } as unknown as Partial<Client> & {
    // expose isOpen as a getter
    readonly isOpen: boolean
  }

  Object.defineProperty(mock, 'isOpen', {
    get: () => open,
  })

  return mock as unknown as Client
}

describe('tokenStore', () => {
  let client: Client
  let tokenStore: TokenStore

  beforeEach(() => {
    client = makeMockRedisClient()
    tokenStore = new TokenStore(client)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can retrieve token', async () => {
    ;(client.get as jest.Mock).mockResolvedValue('token-1')

    await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')

    expect(client.connect).toHaveBeenCalledTimes(1)
    expect(client.get).toHaveBeenCalledWith('systemToken:user-1')
  })

  it('Can set token', async () => {
    ;(client.set as jest.Mock).mockResolvedValue('OK')

    await tokenStore.setToken('user-1', 'token-1', 10)

    expect(client.connect).toHaveBeenCalledTimes(1)
    expect(client.set).toHaveBeenCalledWith('systemToken:user-1', 'token-1', { EX: 10 })
  })
})
