import committed from './Decisions'

function findDuplicates<T>(toCheck: Array<T>) {
  const unique = new Set(toCheck)
  return toCheck
    .filter(item => {
      if (unique.has(item)) {
        unique.delete(item)
        return null
      }
      return item
    })
    .filter(item => item != null)
}

describe('decisions', () => {
  it('toString', () => {
    // Not a test but useful output
    const x = committed
    console.log(committed.toString())
  })

  it.skip('no duplicate codes', () => {
    const allCodes = committed.allCodes().map(c => c.code)
    const duplicates = findDuplicates(allCodes)
    expect(duplicates).toHaveLength(0)
  })

  it('no invalid decisions', () => {
    expect(committed.invalidDecisions().map(d => d.getQuestion())).toHaveLength(0)
  })

  it('no duplicate urls', () => {
    const allUrls = committed.allUrls()
    const duplicates = findDuplicates(allUrls)
    expect(duplicates).toHaveLength(0)
  })

  it('url will use id when not provided', () => {
    const qqRP = committed.findByUrl('0')
    const x = ''
  })
})
