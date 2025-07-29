import { ApiPageRequest, ApiPageResponse } from '../../data/ApiData'
import PageResponse from './pageResponse'

type PageLink = {
  text: string
  href: string
}

type NumberedPageLink = {
  text: string
  href: string
  selected?: boolean // default = false
}

type ResultsMetaData = {
  from: number
  to: number
  count: number
}

type PageViewModel = {
  results: ResultsMetaData
  previous: PageLink | null
  next: PageLink | null
  items: NumberedPageLink[] | null
}

export function pageRequestFrom(pageSize: number, pageNumber: number): ApiPageRequest {
  return {
    size: pageSize,
    number: pageNumber - 1,
  }
}

export default function mojPaginationFromPageResponse<T>(
  reportPageResponse: ApiPageResponse<T>,
  url: URL,
): PageViewModel {
  const pageResponse = new PageResponse(
    reportPageResponse.size,
    reportPageResponse.number + 1,
    reportPageResponse.totalElements,
  )
  return {
    results: {
      from: pageResponse.resultsFrom(),
      to: pageResponse.resultsTo(),
      count: pageResponse.totalElements,
    },
    previous: mojPreviousFromPageResponse(pageResponse, url),
    next: mojNextFromPageResponse(pageResponse, url),
    items: mojItemsFromPageResponse(pageResponse, url),
  }
}

function mojItemsFromPageResponse(pageResponse: PageResponse, url: URL): NumberedPageLink[] | null {
  return (
    (!pageResponse.singlePageOfResults() &&
      pageResponse.pageRange(5, 4).map(pageNumber => {
        url.searchParams.set('pageNumber', pageNumber.toString())
        return { text: pageNumber.toString(), href: url.href, selected: pageNumber === pageResponse.pageNumber }
      })) ||
    null
  )
}

function mojPreviousFromPageResponse(pageResponse: PageResponse, url: URL): PageLink | null {
  url.searchParams.set('pageNumber', (pageResponse.pageNumber - 1).toString())
  return (
    (pageResponse.hasPrevious() && {
      text: 'Previous',
      href: url.href,
    }) ||
    null
  )
}

function mojNextFromPageResponse(pageResponse: PageResponse, url: URL): PageLink | null {
  url.searchParams.set('pageNumber', (pageResponse.pageNumber + 1).toString())
  return (
    (pageResponse.hasNext() && {
      text: 'Next',
      href: url.href,
    }) ||
    null
  )
}
