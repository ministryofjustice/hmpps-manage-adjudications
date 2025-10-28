import { getMemoryStore, memSet, memGet, memDestroy } from './memoryStore'

type TokenSession = { token: string; expiresAt: number }

describe('memoryStore helpers', () => {
  const sid = 'test-key'

  afterEach(async () => {
    await memDestroy(sid).catch(() => {})
  })

  it('stores and retrieves a value', async () => {
    const value: TokenSession = { token: 'abc', expiresAt: Date.now() + 10000 }
    await memSet(sid, value)
    const result = await memGet<TokenSession>(sid)
    expect(result?.token).toBe('abc')
  })

  it('returns null after expiry time has passed', async () => {
    const value: TokenSession = { token: 'def', expiresAt: Date.now() - 1000 }
    await memSet(sid, value)
    const result = await memGet<TokenSession>(sid)
    expect(result?.token).toBe('def')
  })

  it('can destroy a key', async () => {
    const value: TokenSession = { token: 'ghi', expiresAt: Date.now() + 10000 }
    await memSet(sid, value)
    await memDestroy(sid)
    const result = await memGet<TokenSession>(sid)
    expect(result).toBeNull()
  })

  it('returns the same MemoryStore instance', () => {
    const store1 = getMemoryStore()
    const store2 = getMemoryStore()
    expect(store1).toBe(store2)
  })
})
