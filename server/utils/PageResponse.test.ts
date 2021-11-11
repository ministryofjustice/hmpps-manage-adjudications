import { pageRequestFrom, PageResponse, pageResponseFrom } from './PageResponse'
import { numberRange } from './utils'

describe('totalPages', () => {
  it('no results', () => {
    expect(new PageResponse(10, 1, 0, null).totalPages()).toEqual(0)
  })
  it('less than a full page of results', () => {
    expect(new PageResponse(10, 1, 9, null).totalPages()).toEqual(1)
  })
  it('a full page of results', () => {
    expect(new PageResponse(10, 1, 10, null).totalPages()).toEqual(1)
  })
  it('a single result more than one page', () => {
    expect(new PageResponse(10, 1, 11, null).totalPages()).toEqual(2)
  })
  it('many pages', () => {
    expect(new PageResponse(10, 1, 100, null).totalPages()).toEqual(10)
  })
})

describe('pageResponseFrom', () => {
  it('no results', () => {
    expect(pageResponseFrom<number>(pageRequestFrom(5, 1), []).totalPages()).toEqual(0)
  })
  it('one result', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 1), numberRange(1, 1))
    expect(response.totalPages()).toEqual(1)
    expect(response.results).toEqual(numberRange(1, 1))
  })
  it('first page where there is more than one page of results', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 1), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
    expect(response.results).toEqual(numberRange(1, 5))
  })
  it('last page where there is more than one page of results', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 2), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
    expect(response.results).toEqual(numberRange(6, 6))
  })
  it('first page where there is more than one page of results and the first page is zero', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 0, 0), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
    expect(response.results).toEqual(numberRange(1, 5))
  })
  it('last page where there is more than one page of results and the first page is zero', () => {
    const response = pageResponseFrom<number>(pageRequestFrom(5, 1, 0), numberRange(1, 6))
    expect(response.totalPages()).toEqual(2)
    expect(response.results).toEqual(numberRange(6, 6))
  })

  describe('generate pages from a results set', () => {
    it('change from first page being one to being zero', () => {
      const response = pageResponseFrom<number>(pageRequestFrom(5, 2, 1), numberRange(1, 20))
      expect(response.firstPage).toEqual(1)
      expect(response.pageNumber).toEqual(2)
      expect(response.lastPage()).toEqual(4)
      expect(response.totalPages()).toEqual(4)
      expect(response.results).toEqual(numberRange(6, 10))

      const changeStartPage = response.changeIndex(0)
      expect(changeStartPage.firstPage).toEqual(0)
      expect(changeStartPage.pageNumber).toEqual(1)
      expect(changeStartPage.lastPage()).toEqual(3)
      expect(changeStartPage.totalPages()).toEqual(4)
      expect(changeStartPage.results).toEqual(numberRange(6, 10))
    })
    it('change from first page being zero to being one', () => {
      const response = pageResponseFrom<number>(pageRequestFrom(5, 1, 0), numberRange(1, 20))
      expect(response.firstPage).toEqual(0)
      expect(response.pageNumber).toEqual(1)
      expect(response.lastPage()).toEqual(3)
      expect(response.totalPages()).toEqual(4)
      expect(response.results).toEqual(numberRange(6, 10))

      const changeStartPage = response.changeIndex(1)
      expect(changeStartPage.firstPage).toEqual(1)
      expect(changeStartPage.pageNumber).toEqual(2)
      expect(changeStartPage.lastPage()).toEqual(4)
      expect(changeStartPage.totalPages()).toEqual(4)
      expect(changeStartPage.results).toEqual(numberRange(6, 10))
    })
  })
})
