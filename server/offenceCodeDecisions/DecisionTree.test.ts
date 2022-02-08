import decisionTree from './DecisionTree'
import Decision from './Decision'

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
    // eslint-disable-next-line no-console
    console.log(decisionTree.toString())
  })

  it('no invalid decisions', () => {
    function invalid(decision: Decision): boolean {
      return (
        (decision.getChildren().length === 0 && decision.getCode() == null) ||
        (decision.getChildren().length !== 0 && decision.getTitle() == null) ||
        (decision.getUrl() != null &&
          decision.matching(d => d !== decision && d.getUrl() === decision.getUrl()).length !== 0) ||
        (decision.getUrl() != null && decision.getUrl().startsWith('/')) ||
        (decision.getPage() != null && decision.getPage().startsWith('/'))
      )
    }
    const invalidDecisions = decisionTree.matching(invalid)
    expect(invalidDecisions.map(d => d.getQuestion())).toHaveLength(0)
  })

  it('no duplicate urls', () => {
    const allUrls = decisionTree.allUrls()
    const duplicates = findDuplicates(allUrls)
    expect(duplicates).toHaveLength(0)
  })
})
