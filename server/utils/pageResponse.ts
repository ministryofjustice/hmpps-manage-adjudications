import { numberRange } from './utils'
import PageRequest from './pageRequest'

export class PageResponse<T> {
  constructor(
    readonly pageSize: number,
    readonly pageNumber: number,
    readonly totalResults: number,
    readonly results: T[],
    readonly firstPage: number = 1
  ) {}

  changeIndex(newFirstPage: number): PageResponse<T> {
    const offset = this.firstPage - newFirstPage
    return new PageResponse<T>(this.pageSize, this.pageNumber - offset, this.totalResults, this.results, newFirstPage)
  }

  totalPages(): number {
    return Math.floor((this.totalResults - 1) / this.pageSize) + 1
  }

  resultsFrom(): number {
    return Math.min(this.totalResults, (this.pageNumber - this.firstPage) * this.pageSize + 1)
  }

  resultsTo(): number {
    return Math.min(this.totalResults, (this.pageNumber - this.firstPage + 1) * this.pageSize)
  }

  lastPage(): number {
    return this.totalPages() + this.firstPage - 1
  }

  pageRange(before: number, after: number): number[] {
    const idealStart = this.pageNumber - before
    const idealEnd = this.pageNumber + after
    if (idealStart < this.firstPage) {
      // We would start before the first page - push the range forward so we start at the first page.
      const offset = this.firstPage - idealStart
      const end = Math.min(this.lastPage(), idealEnd + offset)
      const start = this.firstPage
      return numberRange(start, end)
    }
    if (idealEnd > this.lastPage()) {
      // We would finish after the last page - push the range backwards so we finish at the last page.
      const offset = idealEnd - this.lastPage()
      const start = Math.max(this.firstPage, idealStart - offset)
      const end = this.lastPage()
      return numberRange(start, end)
    }
    // We can accommodated the range with the pages we have.
    return numberRange(idealStart, idealEnd)
  }

  hasNext(): boolean {
    return this.pageNumber < this.totalPages()
  }

  hasPrevious(): boolean {
    return this.pageNumber > this.firstPage
  }
}

export function pageRequestFrom(pageSize: number, pageNumber: number, firstPage = 1): PageRequest {
  return new PageRequest(pageSize, pageNumber, firstPage)
}

export function pageResponseFrom<T>(pageRequest: PageRequest, allResults: T[]): PageResponse<T> {
  const totalResults = allResults.length
  const { pageNumber } = pageRequest
  const { pageSize } = pageRequest
  const { firstPage } = pageRequest
  const results = allResults.slice((pageNumber - firstPage) * pageSize, (pageNumber - firstPage + 1) * pageSize)
  return new PageResponse<T>(pageSize, pageNumber, totalResults, results, firstPage)
}
