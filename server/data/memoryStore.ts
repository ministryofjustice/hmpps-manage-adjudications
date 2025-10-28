import session from 'express-session'

let sharedStore: session.MemoryStore | null = null

export function getMemoryStore(): session.MemoryStore {
  if (!sharedStore) sharedStore = new session.MemoryStore()
  return sharedStore
}

export function memGet<T>(sid: string): Promise<T | null> {
  const store = getMemoryStore()
  return new Promise<T | null>((resolve, reject) => {
    store.get(sid, (err, sess) => {
      if (err) reject(err)
      else resolve((sess as unknown as T) ?? null)
    })
  })
}

export function memSet<T>(sid: string, data: T): Promise<void> {
  const store = getMemoryStore()
  return new Promise<void>((resolve, reject) => {
    store.set(sid, data as unknown as session.SessionData, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export function memDestroy(sid: string): Promise<void> {
  const store = getMemoryStore()
  return new Promise<void>(resolve => {
    store.destroy(sid, () => resolve())
  })
}
