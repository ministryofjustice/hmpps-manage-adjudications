import TokenStore from './tokenStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
}

describe('tokenStore', () => {
  let tokenStore: TokenStore

  beforeEach(() => {
    tokenStore = new TokenStore(redisClient as any)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can retrieve token', async () => {
    redisClient.get.mockResolvedValue('token-1')
    await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')
  })

  it('Can set token', async () => {
    redisClient.set.mockResolvedValue('OK')
    await tokenStore.setToken('user-1', 'token-1', 10)
  })
})
