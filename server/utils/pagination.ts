import { PageResponse } from './pageResponse'

export default function mojPaginationFromPageResponse<T>(pageResponse: PageResponse<T>, url: URL): Record<string, any> {
  return {
    results: {
      from: pageResponse.resultsFrom(),
      to: pageResponse.resultsTo(),
      count: pageResponse.totalResults,
    },
    ...mojPreviousFromPageResponse(pageResponse, url),
    ...mojNextFromPageResponse(pageResponse, url),
    items: pageResponse.pageRange(5, 4).map(pageNumber => {
      url.searchParams.set('pageNumber', pageNumber.toString())
      return { text: pageNumber.toString(), href: url.href, selected: pageNumber === pageResponse.pageNumber }
    }),
  }
}

function mojPreviousFromPageResponse<T>(pageResponse: PageResponse<T>, url: URL) {
  url.searchParams.set('pageNumber', (pageResponse.pageNumber - 1).toString())
  return (
    (pageResponse.hasPrevious() && {
      previous: {
        text: 'Previous',
        href: url.href,
      },
    }) ||
    {}
  )
}

function mojNextFromPageResponse<T>(pageResponse: PageResponse<T>, url: URL) {
  url.searchParams.set('pageNumber', (pageResponse.pageNumber + 1).toString())
  return (
    (pageResponse.hasNext() && {
      next: {
        text: 'Next',
        href: url.href,
      },
    }) ||
    {}
  )
}
