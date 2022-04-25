/* eslint-disable */
import decisionTree from './DecisionTree'
import { decision, Question } from './Question'
import { answer, Answer } from './Answer'

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

function missingOffenceCode(answerToCheck: Answer): boolean {
  return !answerToCheck.getChildQuestion() && !answerToCheck.getOffenceCode()
}

function duplicateUrls(decisionToCheck: Question) {
  return (
    decisionToCheck.getUrl() != null &&
    decisionToCheck.matchingDecisions(d => d !== decisionToCheck && d.getUrl() === decisionToCheck.getUrl()).length !== 0
  )
}

function urlsStartingWithSlash(decisionToCheck: Question) {
  return decisionToCheck.getUrl() != null && decisionToCheck.getUrl().startsWith('/')
}

function template() {
  return decision('question 1')
    .child(answer('answer 1-1')
      .child(decision('question 1-1')
        .child(answer('answer 1-1-1'))))
    .child(answer('answer 1-2')
      .child(decision('question 1-2')
        .child(answer('answer 1-2-1'))))
}

describe('decisions', () => {
  it('toString', () => {
    // Not a test but useful output
    // eslint-disable-next-line no-console
    console.log(decisionTree.toString())
  })

  it('no answers missing offence codes', () => {
    const answersWithMissingOffenceCodes = decisionTree.matchingAnswers(missingOffenceCode)
    expect(answersWithMissingOffenceCodes).toHaveLength(0)
  })

  it('check we find answers with missing offence codes when they exist', () => {
    const withMissingOffenceCode = template() // The template does not have offence codes
    const answersWithMissingOffenceCodes = withMissingOffenceCode.matchingAnswers(missingOffenceCode)
    expect(answersWithMissingOffenceCodes.length).toBeGreaterThan(0)
  })

  it('no questions with duplicate urls', () => {
    const decisionsWithDuplicateUrls = decisionTree.matchingDecisions(duplicateUrls)
    expect(decisionsWithDuplicateUrls).toHaveLength(0)
  })

  it('check we find questions with duplicate urls when they exist', () => {
    const withDuplicateUrls = template()
    withDuplicateUrls.findDecisionById('1-1').url('not-unique')
    withDuplicateUrls.findDecisionById('1-2').url('not-unique')
    const questionsWithDuplicateUrls = withDuplicateUrls.matchingDecisions(duplicateUrls)
    expect(questionsWithDuplicateUrls).toHaveLength(0)
  })

  it('no questions with urls starting with a slash', () => {
    const decisionsWithUrlsStartingWithSlash = decisionTree.matchingDecisions(urlsStartingWithSlash)
    expect(decisionsWithUrlsStartingWithSlash).toHaveLength(0)
  })

  it('check we find questions with urls starting with a slash when they exist', () => {
    const withUrlStartingWithASlash = template()
    withUrlStartingWithASlash.findDecisionById('1-1').url('/starts-with-a-slash')
    const questionsWithUrlsStartingWithSlash = withUrlStartingWithASlash.matchingDecisions(urlsStartingWithSlash)
    expect(questionsWithUrlsStartingWithSlash.length).toBeGreaterThan(0)
  })

  it('no answers with duplicate offence codes', () => {
    const allCodeIds = decisionTree.allCodes()
    const duplicates = findDuplicates(allCodeIds)
    expect(duplicates).toHaveLength(0)
  })

  it('check we answers with duplicate offence codes when they exist', () => {
    const shouldBeDuplicates = decision('question 1')
      .child(answer('answer 1-1').offenceCode(1))
      .child(answer('answer 1-2').offenceCode(1))
      .allCodes()
    const duplicates = findDuplicates(shouldBeDuplicates)
    expect(duplicates).toHaveLength(1)
  })
})
