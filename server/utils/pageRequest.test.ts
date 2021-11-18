import PageRequest from './pageRequest'

describe('changeIndex', () => {
  it('change from first page being one to being zero', () => {
    const request = new PageRequest(20, 2, 1)
    const changeStartPage = request.changeIndex(0)
    expect(changeStartPage.firstPage).toEqual(0)
    expect(changeStartPage.number).toEqual(1)
  })
  it('change from first page being zero to being one', () => {
    const request = new PageRequest(20, 1, 0)
    const changeStartPage = request.changeIndex(1)
    expect(changeStartPage.firstPage).toEqual(1)
    expect(changeStartPage.number).toEqual(2)
  })
})
