import { PageRequest, pageRequestFrom, PageResponse, pageResponseFrom } from './Pagination'

describe('Total pages', () => {
  it('no results', () => {
    expect(new PageResponse(10, 0, 0, null).totalPages()).toEqual(0)
  })
  it('less than a full page of results', () => {
    expect(new PageResponse(10, 0, 9, null).totalPages()).toEqual(1)
  })
  it('a full page of results', () => {
    expect(new PageResponse(10, 0, 10, null).totalPages()).toEqual(1)
  })
  it('a single result more than one page', () => {
    expect(new PageResponse(10, 0, 11, null).totalPages()).toEqual(2)
  })
  it('many pages', () => {
    expect(new PageResponse(10, 0, 100, null).totalPages()).toEqual(10)
  })
})

describe('generate pages from a results set', () => {
  it('no results', () => {
    expect(pageResponseFrom<string>(pageRequestFrom(5, 0), []).totalPages()).toEqual(0)
  })
  it('one result', () => {
    const response = pageResponseFrom<string>(pageRequestFrom(5, 0), ['1'])
    expect(response.totalPages()).toEqual(1)
    expect(response.results).toEqual(['1'])
  })
  it('first page where there is more than one page of results', () => {
    const response = pageResponseFrom<string>(pageRequestFrom(5, 0), ['1', '2', '3', '4', '5', '6'])
    expect(response.totalPages()).toEqual(2)
    expect(response.results).toEqual(['1', '2', '3', '4', '5'])
  })
  it('last page where there is more than one page of results', () => {
    const response = pageResponseFrom<string>(pageRequestFrom(5, 1), ['1', '2', '3', '4', '5', '6'])
    expect(response.totalPages()).toEqual(2)
    expect(response.results).toEqual(['6'])
  })
})
