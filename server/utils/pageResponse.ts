import { numberRange } from './utils'
import PageRequest from './pageRequest'

export class PageResponse<T> {
  constructor(
    readonly size: number,
    readonly number: number,
    readonly numberOfElements: number,
    readonly content: T[],
    readonly firstPage: number = 1
  ) {}

  changeIndex(newFirstPage: number): PageResponse<T> {
    const offset = this.firstPage - newFirstPage
    return new PageResponse<T>(this.size, this.number - offset, this.numberOfElements, this.content, newFirstPage)
  }

  totalPages(): number {
    return Math.floor((this.numberOfElements - 1) / this.size) + 1
  }

  singlePageOfResults(): boolean {
    return this.totalPages() === 1
  }

  resultsFrom(): number {
    return Math.min(this.numberOfElements, (this.number - this.firstPage) * this.size + 1)
  }

  resultsTo(): number {
    return Math.min(this.numberOfElements, (this.number - this.firstPage + 1) * this.size)
  }

  lastPage(): number {
    return this.totalPages() + this.firstPage - 1
  }

  pageRange(before: number, after: number): number[] {
    const idealStart = this.number - before
    const idealEnd = this.number + after
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
    return this.number < this.lastPage()
  }

  hasPrevious(): boolean {
    return this.number > this.firstPage
  }
}

export function pageRequestFrom(pageSize: number, pageNumber: number, firstPage = 1): PageRequest {
  return new PageRequest(pageSize, pageNumber, firstPage)
}

export function pageResponseFrom<T>(pageRequest: PageRequest, allResults: T[]): PageResponse<T> {
  const totalResults = allResults.length
  const { number } = pageRequest
  const { size } = pageRequest
  const { page } = pageRequest
  const results = allResults.slice((number - page) * size, (number - page + 1) * size)
  return new PageResponse<T>(size, number, totalResults, results, page)
}
