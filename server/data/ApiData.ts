export type ApiPageResponse<T> = {
  readonly size: number
  readonly number: number // zero-based!
  readonly totalElements: number
  readonly content: T[]
}

export type ApiPageRequest = {
  readonly size: number
  readonly number: number // zero-based!
}
