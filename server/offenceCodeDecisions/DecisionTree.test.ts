/* eslint-disable */
import decisionTree, { paragraph1, paragraph12 } from './DecisionTree'
import { Answer } from './Answer'
import { answer, question } from './Decisions'

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

function template() {
  return question('question 1')
    .child(answer('answer 1-1')
      .child(question('question 1-1')
        .child(answer('answer 1-1-1'))))
    .child(answer('answer 1-2')
      .child(question('question 1-2')
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

  if( 'check that find duplicate method works as expected') {
    const arrayWithDuplicates = ['1', '1-1', '1-2', '1-3', '1-4', '1-2', '1-4']
    const duplicates = findDuplicates(arrayWithDuplicates)
    expect(duplicates).toEqual(['1-2', '1-4'])
  }

  it('no questions with duplicate ids', () => {
    const allIds = decisionTree.allIds()
    const duplicates = findDuplicates(allIds)
    expect(duplicates).toHaveLength(0)
  })

  it('no answers with duplicate offence codes', () => {
    const allCodeIds = decisionTree.allCodes()
    const duplicates = findDuplicates(allCodeIds)
    expect(duplicates).toHaveLength(0)
  })

  it('check we answers with duplicate offence codes when they exist', () => {
    const shouldBeDuplicates = question('question 1')
      .child(answer('answer 1-1').offenceCode(1))
      .child(answer('answer 1-2').offenceCode(1))
      .allCodes()
    const duplicates = findDuplicates(shouldBeDuplicates)
    expect(duplicates).toHaveLength(1)
  })
})
