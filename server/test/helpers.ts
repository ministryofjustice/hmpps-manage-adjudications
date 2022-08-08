export const makeError = (key: string, value: unknown): Error =>
  new (class TestError extends Error {
    constructor() {
      super()
      this[key] = value
    }
  })()

export const makeNotFoundError = (): Error => makeError('response', { status: 404 })

export const makeSearchApiNotFoundError = (): Error => makeError('status', 404)

export default { makeError, makeNotFoundError }
