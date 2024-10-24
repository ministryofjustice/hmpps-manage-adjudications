import { numberRange } from '../utils'

export default class PageResponse {
  constructor(
    readonly size: number,
    readonly pageNumber: number,
    readonly totalElements: number
  ) {}

  pageRange(pagesBefore: number, pagesAfter: number): number[] {
    const idealStartPage = this.pageNumber - pagesBefore
    const idealEnd = this.pageNumber + pagesAfter
    if (idealStartPage < 1) {
      // We would start before the first page - push the range forward so we start at the first page.
      const offset = 1 - idealStartPage
      const end = Math.min(this.lastPage(), idealEnd + offset)
      const start = 1
      return numberRange(start, end)
    }
    if (idealEnd > this.lastPage()) {
      // We would finish after the last page - push the range backwards so we finish at the last page.
      const offset = idealEnd - this.lastPage()
      const start = Math.max(1, idealStartPage - offset)
      const end = this.lastPage()
      return numberRange(start, end)
    }
    // We can accommodated the range with the pages we have.
    return numberRange(idealStartPage, idealEnd)
  }

  singlePageOfResults(): boolean {
    return this.totalPages() === 1
  }

  resultsFrom(): number {
    return Math.min(this.totalElements, (this.pageNumber - 1) * this.size + 1)
  }

  resultsTo(): number {
    return Math.min(this.totalElements, (this.pageNumber - 1 + 1) * this.size)
  }

  hasNext(): boolean {
    return this.pageNumber < this.lastPage()
  }

  hasPrevious(): boolean {
    return this.pageNumber > 1
  }

  // Public for testing only
  totalPages(): number {
    return Math.floor((this.totalElements - 1) / this.size) + 1
  }

  private lastPage(): number {
    return this.totalPages()
  }
}
