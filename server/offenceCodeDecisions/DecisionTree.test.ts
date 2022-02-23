import decisionTree from './DecisionTree'
import { Decision } from './Decision'
import { Answer } from './Answer'

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
    function missingOffenceCode(answer: Answer): boolean {
      return !answer.getChildDecision() && !answer.getOffenceCode()
    }
    const answersWithMissingOffenceCodes = decisionTree.matchingAnswers(missingOffenceCode)
    expect(answersWithMissingOffenceCodes.map(a => a.getText())).toHaveLength(0)

    function duplicateUrls(decision: Decision) {
      return (
        decision.getUrl() != null &&
        decision.matchingDecisions(d => d !== decision && d.getUrl() === decision.getUrl()).length !== 0
      )
    }
    const decisionsWithDuplicateUrls = decisionTree.matchingDecisions(duplicateUrls)
    expect(decisionsWithDuplicateUrls.map(a => a.getTitle())).toHaveLength(0)

    function urlsStartingWithSlash(decision: Decision) {
      return decision.getUrl() != null && decision.getUrl().startsWith('/')
    }
    const decisionsWithUrlsStartingWithSlash = decisionTree.matchingDecisions(urlsStartingWithSlash)
    expect(decisionsWithUrlsStartingWithSlash.map(a => a.getTitle())).toHaveLength(0)
  })

  it('no duplicate urls', () => {
    const allUrls = decisionTree.allUrls()
    const duplicates = findDuplicates(allUrls)
    expect(duplicates).toHaveLength(0)
  })

  it('no duplicate code ids', () => {
    const allCodeIds = decisionTree.allCodes()
    const duplicates = findDuplicates(allCodeIds)
    expect(duplicates).toHaveLength(0)
  })
})
