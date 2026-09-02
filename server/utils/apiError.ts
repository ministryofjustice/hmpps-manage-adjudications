type ApiError = {
  status?: number
  data?: {
    userMessage?: unknown
  }
}

export const getApiValidationMessage = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null) return null

  const apiError = error as ApiError
  const userMessage = apiError.data?.userMessage

  if (apiError.status !== 400 || typeof userMessage !== 'string') return null

  return userMessage.replace(/^Validation failure:\s*/, '')
}
