import log from '../log'

// eslint-disable-next-line import/prefer-default-export
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, attempts = 0): Promise<T> {
  try {
    return await fn() // Return the result if the function succeeds
  } catch (err) {
    if (attempts >= retries - 1) {
      log.error(`Failed after ${retries} attempts:`, err)
      throw err // Throw the error if retries are exhausted
    }
    return withRetry(fn, retries, attempts + 1)
  }
}
