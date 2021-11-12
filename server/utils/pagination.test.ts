import { PageResponse } from './pageResponse'
import mojPaginationFromPageResponse from './pagination'

describe('mojPaginationFromPageResponse', () => {
  const baseUrl = new URL('http://localhost/')
  it('no results', () => {
    expect(mojPaginationFromPageResponse(new PageResponse(10, 1, 0, null), baseUrl)).toEqual({
      items: [],
      results: {
        count: 0,
        from: 0,
        to: 0,
      },
    })
  })
})
