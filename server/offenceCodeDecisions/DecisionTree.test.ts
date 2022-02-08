import decisionTree from './DecisionTree'

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
  it.skip('toString', () => {
    // Not a test but useful output
    // eslint-disable-next-line no-console
    console.log(decisionTree.toString())
  })

  it('no invalid decisions', () => {
    expect(decisionTree.invalidDecisions().map(d => d.getQuestion())).toHaveLength(0)
  })

  it('no duplicate urls', () => {
    const allUrls = decisionTree.allUrls()
    const duplicates = findDuplicates(allUrls)
    expect(duplicates).toHaveLength(0)
  })
})
