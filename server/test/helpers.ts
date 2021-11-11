export const makeError = (key: any, value: any) =>
  new (class TestError extends Error {
    constructor() {
      super()
      this[key] = value
    }
  })()

export const makeNotFoundError = () => makeError('response', { status: 404 })

export default { makeError, makeNotFoundError }
