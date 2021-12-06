import mojPaginationFromPageResponse, { pageRequestFrom } from './pagination'

describe('mojPaginationFromPageResponse', () => {
  const baseUrl = new URL('http://localhost/')
  const dummyData = [] as string[]
  it('no results', () => {
    const apiResults = {
      size: 10,
      number: 0,
      totalElements: 0,
      content: dummyData,
    }
    expect(mojPaginationFromPageResponse(apiResults, baseUrl)).toEqual({
      items: [],
      previous: null,
      next: null,
      results: {
        count: 0,
        from: 0,
        to: 0,
      },
    })
  })
  it('one result', () => {
    const apiResults = {
      size: 10,
      number: 0,
      totalElements: 1,
      content: dummyData,
    }
    expect(mojPaginationFromPageResponse(apiResults, baseUrl)).toEqual({
      items: null,
      previous: null,
      next: null,
      results: {
        count: 1,
        from: 1,
        to: 1,
      },
    })
  })
  it('first page of many pages', () => {
    const apiResults = {
      size: 10,
      number: 0,
      totalElements: 200,
      content: dummyData,
    }
    expect(mojPaginationFromPageResponse(apiResults, baseUrl)).toEqual({
      items: [
        { href: 'http://localhost/?pageNumber=1', selected: true, text: '1' },
        { href: 'http://localhost/?pageNumber=2', selected: false, text: '2' },
        { href: 'http://localhost/?pageNumber=3', selected: false, text: '3' },
        { href: 'http://localhost/?pageNumber=4', selected: false, text: '4' },
        { href: 'http://localhost/?pageNumber=5', selected: false, text: '5' },
        { href: 'http://localhost/?pageNumber=6', selected: false, text: '6' },
        { href: 'http://localhost/?pageNumber=7', selected: false, text: '7' },
        { href: 'http://localhost/?pageNumber=8', selected: false, text: '8' },
        { href: 'http://localhost/?pageNumber=9', selected: false, text: '9' },
        { href: 'http://localhost/?pageNumber=10', selected: false, text: '10' },
      ],
      previous: null,
      next: {
        href: 'http://localhost/?pageNumber=2',
        text: 'Next',
      },
      results: {
        count: 200,
        from: 1,
        to: 10,
      },
    })
  })
  it('second page of many pages', () => {
    const apiResults = {
      size: 10,
      number: 1,
      totalElements: 200,
      content: dummyData,
    }
    expect(mojPaginationFromPageResponse(apiResults, baseUrl)).toEqual({
      items: [
        { href: 'http://localhost/?pageNumber=1', selected: false, text: '1' },
        { href: 'http://localhost/?pageNumber=2', selected: true, text: '2' },
        { href: 'http://localhost/?pageNumber=3', selected: false, text: '3' },
        { href: 'http://localhost/?pageNumber=4', selected: false, text: '4' },
        { href: 'http://localhost/?pageNumber=5', selected: false, text: '5' },
        { href: 'http://localhost/?pageNumber=6', selected: false, text: '6' },
        { href: 'http://localhost/?pageNumber=7', selected: false, text: '7' },
        { href: 'http://localhost/?pageNumber=8', selected: false, text: '8' },
        { href: 'http://localhost/?pageNumber=9', selected: false, text: '9' },
        { href: 'http://localhost/?pageNumber=10', selected: false, text: '10' },
      ],
      previous: {
        href: 'http://localhost/?pageNumber=1',
        text: 'Previous',
      },
      next: {
        href: 'http://localhost/?pageNumber=3',
        text: 'Next',
      },
      results: {
        count: 200,
        from: 11,
        to: 20,
      },
    })
  })
  it('last page of many pages', () => {
    const apiResults = {
      size: 10,
      number: 19,
      totalElements: 200,
      content: dummyData,
    }
    expect(mojPaginationFromPageResponse(apiResults, baseUrl)).toEqual({
      items: [
        { href: 'http://localhost/?pageNumber=11', selected: false, text: '11' },
        { href: 'http://localhost/?pageNumber=12', selected: false, text: '12' },
        { href: 'http://localhost/?pageNumber=13', selected: false, text: '13' },
        { href: 'http://localhost/?pageNumber=14', selected: false, text: '14' },
        { href: 'http://localhost/?pageNumber=15', selected: false, text: '15' },
        { href: 'http://localhost/?pageNumber=16', selected: false, text: '16' },
        { href: 'http://localhost/?pageNumber=17', selected: false, text: '17' },
        { href: 'http://localhost/?pageNumber=18', selected: false, text: '18' },
        { href: 'http://localhost/?pageNumber=19', selected: false, text: '19' },
        { href: 'http://localhost/?pageNumber=20', selected: true, text: '20' },
      ],
      previous: {
        href: 'http://localhost/?pageNumber=19',
        text: 'Previous',
      },
      next: null,
      results: {
        count: 200,
        from: 191,
        to: 200,
      },
    })
  })
})

describe('pageRequestFrom', () => {
  it('does correct conversion from one-based to zero-based and transfers requested page size', () => {
    expect(pageRequestFrom(10, 2)).toEqual({
      size: 10,
      number: 1,
    })
  })
})
