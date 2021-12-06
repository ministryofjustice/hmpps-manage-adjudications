import { ApiPageRequest, ApiPageResponse } from '../data/ApiData'
import PageResponse from '../utils/mojPagination/pageResponse'

export default function pageResponseFrom<T>(pageRequest: ApiPageRequest, allResults: T[]): PageResponse {
  const totalResults = allResults.length
  const { number: zeroBasedPageNumber } = pageRequest
  const { size } = pageRequest
  return new PageResponse(size, zeroBasedPageNumber + 1, totalResults)
}

export function apiPageResponseFrom<T>(pageRequest: ApiPageRequest, allResults: T[]): ApiPageResponse<T> {
  const totalResults = allResults.length
  const { number } = pageRequest
  const { size } = pageRequest
  const results = allResults.slice(number * size, (number + 1) * size)
  return {
    size,
    number,
    totalElements: totalResults,
    content: results,
  }
}
