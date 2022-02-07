import decisionTrees from './DecisionTrees'

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
    decisionTrees.forEach(decisionTree => console.log(decisionTree.toString()))
  })

  it.skip('no duplicate codes', () => {
    decisionTrees.forEach(decisionTree => {
      const allCodes = decisionTree.allCodes().map(c => c.code)
      const duplicates = findDuplicates(allCodes)
      expect(duplicates).toHaveLength(0)
    })
  })

  it('no invalid decisions', () => {
    decisionTrees.forEach(decisionTree => {
      expect(decisionTree.invalidDecisions().map(d => d.getQuestion())).toHaveLength(0)
    })
  })

  it('no duplicate urls', () => {
    decisionTrees.forEach(decisionTree => {
      const allUrls = decisionTree.allUrls()
      const duplicates = findDuplicates(allUrls)
      expect(duplicates).toHaveLength(0)
    })
  })
})
