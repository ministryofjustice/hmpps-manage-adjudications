export type PageRequest = {
  pageSize: number
  pageNumber: number
}

export class PageResponse<T> {
  constructor(
    readonly pageSize: number,
    readonly pageNumber: number,
    readonly totalResults: number,
    readonly results: T[]
  ) {}

  totalPages(): number {
    return Math.floor((this.totalResults - 1) / this.pageSize) + 1
  }
}
export function pageRequestFrom(pageSize: number, pageNumber: number): PageRequest {
  return { pageSize, pageNumber }
}

export function pageResponseFrom<T>(pageRequest: PageRequest, allResults: T[]): PageResponse<T> {
  const totalResults = allResults.length
  const { pageNumber } = pageRequest
  const { pageSize } = pageRequest
  const results = allResults.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize)
  return new PageResponse<T>(pageSize, pageNumber, totalResults, results)
}
