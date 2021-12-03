import PageResponse from './pageResponse'
import pageResponseFrom from '../../test/mojPaginationUtils'
import { pageRequestFrom } from './pagination'
import { numberRange } from '../utils'

describe('totalPages', () => {
  it('no results', () => {
    expect(new PageResponse(10, 1, 0).totalPages()).toEqual(0)
  })
  it('less than a full page of results', () => {
    expect(new PageResponse(10, 1, 9).totalPages()).toEqual(1)
  })
  it('a full page of results', () => {
    expect(new PageResponse(10, 1, 10).totalPages()).toEqual(1)
  })
  it('a single result more than one page', () => {
    expect(new PageResponse(10, 1, 11).totalPages()).toEqual(2)
  })
  it('many pages', () => {
    expect(new PageResponse(10, 1, 100).totalPages()).toEqual(10)
  })
})

describe('pageResponseFrom', () => {
  it('no results', () => {
    expect(pageResponseFrom<number>(pageRequestFrom(5, 1), []).totalPages()).toEqual(0)
  })
  it('one result', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 1), numberRange(1, 1))
    expect(response.totalPages()).toEqual(1)
  })
  it('first page where there is more than one page of results', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 1), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
  })
  it('last page where there is more than one page of results', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 2), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
  })
  it('first page where there is more than one page of results and the first page is zero', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 0), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
  })
  it('last page where there is more than one page of results and the first page is zero', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 1), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
  })

  describe('pageRange', () => {
    it('range accommodated in the results, first page is the first page', () => {
      const page6Of20Pages = pageResponseFrom<number>(pageRequestFrom(5, 6), numberRange(1, 100))
      expect(page6Of20Pages.totalPages()).toEqual(20)
      const accommodatedRange = page6Of20Pages.pageRange(5, 4)
      expect(accommodatedRange).toEqual(numberRange(1, 10))
    })
    it('range accommodated in the results, last page is the last page', () => {
      const page16Of20Pages = pageResponseFrom<number>(pageRequestFrom(5, 16), numberRange(1, 100))
      expect(page16Of20Pages.totalPages()).toEqual(20)
      const accommodatedRange = page16Of20Pages.pageRange(5, 4)
      expect(accommodatedRange).toEqual(numberRange(11, 20))
    })
    it('range accommodated in the results, in the middle of the results', () => {
      const page16Of20Pages = pageResponseFrom<number>(pageRequestFrom(5, 10), numberRange(1, 100))
      expect(page16Of20Pages.totalPages()).toEqual(20)
      const accommodatedRange = page16Of20Pages.pageRange(5, 4)
      expect(accommodatedRange).toEqual(numberRange(5, 14))
    })
    it('range not accommodated in the results, at the beginning of the results', () => {
      const page5Of20Pages = pageResponseFrom<number>(pageRequestFrom(5, 5), numberRange(1, 100))
      expect(page5Of20Pages.totalPages()).toEqual(20)
      const accommodatedRange = page5Of20Pages.pageRange(5, 4)
      expect(accommodatedRange).toEqual(numberRange(1, 10))
    })
    it('range not accommodated in the results, at the beginning of the results with a small set of results', () => {
      const page5Of20Pages = pageResponseFrom<number>(pageRequestFrom(5, 1), numberRange(1, 20))
      expect(page5Of20Pages.totalPages()).toEqual(4)
      const accommodatedRange = page5Of20Pages.pageRange(5, 4)
      expect(accommodatedRange).toEqual(numberRange(1, 4))
    })
    it('range not accommodated in the results, at the end of results', () => {
      const page17Of20Pages = pageResponseFrom<number>(pageRequestFrom(5, 17), numberRange(1, 100))
      expect(page17Of20Pages.totalPages()).toEqual(20)
      const accommodatedRange = page17Of20Pages.pageRange(5, 4)
      expect(accommodatedRange).toEqual(numberRange(11, 20))
    })
    it('range not accommodated in the results, at the end of results with a small set of results', () => {
      const page17Of20Pages = pageResponseFrom<number>(pageRequestFrom(5, 3), numberRange(1, 20))
      expect(page17Of20Pages.totalPages()).toEqual(4)
      const accommodatedRange = page17Of20Pages.pageRange(5, 4)
      expect(accommodatedRange).toEqual(numberRange(1, 4))
    })
  })
  describe('resultsTo', () => {
    it('to, where there are more pages', () => {
      const page3WithPageSize5And20Pages = pageResponseFrom<number>(pageRequestFrom(5, 3), numberRange(1, 100))
      expect(page3WithPageSize5And20Pages.resultsTo()).toEqual(15)
    })
    it('to, where this is the last page', () => {
      const page3WithPageSize5And20Pages = pageResponseFrom<number>(pageRequestFrom(5, 3), numberRange(1, 14))
      expect(page3WithPageSize5And20Pages.resultsTo()).toEqual(14)
    })
  })

  describe('resultsFrom', () => {
    it('from', () => {
      const page3WithPageSize5And20Pages = pageResponseFrom<number>(pageRequestFrom(5, 3), numberRange(1, 100))
      expect(page3WithPageSize5And20Pages.resultsFrom()).toEqual(11)
    })
  })
})
