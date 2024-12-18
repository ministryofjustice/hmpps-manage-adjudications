import TokenStore from './tokenStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  isOpen: false,
  connect: jest.fn().mockResolvedValue(undefined),
}

describe('tokenStore', () => {
  let tokenStore: TokenStore

  /* eslint-disable @typescript-eslint/no-explicit-any */
  beforeEach(() => {
    tokenStore = new TokenStore(redisClient as any)
  })
  /* eslint-enable @typescript-eslint/no-explicit-any */

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can retrieve token', async () => {
    redisClient.get.mockResolvedValue('token-1')
    await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')
    expect(redisClient.connect).toHaveBeenCalled()
  })

  it('Can set token', async () => {
    redisClient.set.mockResolvedValue('OK')
    await tokenStore.setToken('user-1', 'token-1', 10)
    expect(redisClient.set).toHaveBeenCalledWith('systemToken:user-1', 'token-1', { EX: 10 })
    expect(redisClient.connect).toHaveBeenCalled()
  })
})
