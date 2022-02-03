import committed from './Decisions'

describe('decisions', () => {
  it('toString', () => {
    // Not a test but useful output
    console.log(committed.toString())
  })

  it.skip('no duplicate codes', () => {
    const allCodes = committed.allCodes().map(c => c.code)
    const unique = new Set(allCodes)
    const duplicates = allCodes
      .filter(item => {
        if (unique.has(item)) {
          unique.delete(item)
          return null
        }
        return item
      })
      .filter(item => item != null)
    expect(duplicates).toHaveLength(0)
  })

  it('no invalid decisions', () => {
    expect(committed.invalidDecisions().map(d => d.getQuestions())).toHaveLength(0)
  })
})
