/* eslint-disable */
import decisionTree, { getOffenceInformation, paragraph1, paragraph12, paragraph1A, paragraph7, paragraph8, paragraph9 } from './DecisionTree'
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
    .child(answer('answer 1-1').child(question('question 1-1').child(answer('answer 1-1-1'))))
    .child(answer('answer 1-2').child(question('question 1-2').child(answer('answer 1-2-1'))))
}

describe('decisions', () => {
  it('toString', () => {
    // Not a test but useful output
    // eslint-disable-next-line no-console
    console.log(decisionTree.toString(0, 1))
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

  it('check that find duplicate method works as expected', () => {
    const arrayWithDuplicates = ['1', '1-1', '1-2', '1-3', '1-4', '1-2', '1-4']
    const duplicates = findDuplicates(arrayWithDuplicates)
    expect(duplicates).toEqual(['1-2', '1-4'])
  })

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

  describe('getOffenceInformation', () => {
    it('returns correctly formatted result for adult offences', () => {
      const allOffenceRules = [
        {
          paragraphNumber: '1(a)',
          paragraphDescription: 'Commits any racially aggravated assault',
        },
        {
          paragraphNumber: '2',
          paragraphDescription: 'Detains any person against his will',
        },
        {
          paragraphNumber: '4',
          paragraphDescription: 'Fights with any person',
        },
        {
          paragraphNumber: '13',
          paragraphDescription: 'Sells or delivers to any person any unauthorised article',
        },
      ]
      const expectedResult = [
        {
          offenceRules: [
            {
              childQuestion: 'Assault, fighting, or endangering the health or personal safety of others',
              paragraphDescription: 'Commits any racially aggravated assault',
              paragraphNumber: '1(a)',
            },
            {
              childQuestion: 'Assault, fighting, or endangering the health or personal safety of others',
              paragraphDescription: 'Fights with any person',
              paragraphNumber: '4',
            },
          ],
          offenceTitle: 'Assault, fighting, or endangering the health or personal safety of others',
        },
        {
          offenceRules: [
            {
              childQuestion: 'Detains another person',
              paragraphDescription: 'Detains any person against his will',
              paragraphNumber: '2',
            },
          ],
          offenceTitle: 'Detains another person',
        },
        {
          offenceRules: [
            {
              childQuestion: 'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
              paragraphDescription: 'Sells or delivers to any person any unauthorised article',
              paragraphNumber: '13',
            },
          ],
          offenceTitle: 'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        },
      ]
      const result = getOffenceInformation(allOffenceRules, false, 1)
      expect(result).toEqual(expectedResult)
    })
    it('returns correctly formatted result for YOI offences', () => {
      const allOffenceRules = [
        {
          paragraphNumber: '2',
          paragraphDescription: 'Commits any racially aggravated assault',
        },
        {
          paragraphNumber: '17',
          paragraphDescription:
            'Intentionally or recklessly sets fire to any part of a young offender institution or any other property, whether or not his own',
        },
        {
          paragraphNumber: '5',
          paragraphDescription: 'Fights with any person',
        },
        {
          paragraphNumber: '5',
          paragraphDescription: 'Fights with any person',
        },
        {
          paragraphNumber: '20',
          paragraphDescription:
            'Absents himself from any place where he is required to be or is present at any place where he is not authorised to be',
        },
        {
          paragraphNumber: '25',
          paragraphDescription: 'Disobeys any lawful order',
        },
      ]
      const expectedResult = [
        {
          offenceRules: [
            {
              childQuestion: 'Assault, fighting, or endangering the health or personal safety of others',
              paragraphDescription: 'Commits any racially aggravated assault',
              paragraphNumber: '2',
            },
            {
              childQuestion: 'Assault, fighting, or endangering the health or personal safety of others',
              paragraphDescription: 'Fights with any person',
              paragraphNumber: '5',
            },
          ],
          offenceTitle: 'Assault, fighting, or endangering the health or personal safety of others',
        },
        {
          offenceRules: [
            {
              childQuestion: 'Sets fire to, or damages, the prison or any property',
              paragraphDescription:
                'Intentionally or recklessly sets fire to any part of a young offender institution or any other property, whether or not his own',
              paragraphNumber: '17',
            },
          ],
          offenceTitle: 'Sets fire to, or damages, the prison or any property',
        },
        {
          offenceRules: [
            {
              childQuestion:
                'Being absent without authorisation, being in an unauthorised place, or failing to work correctly',
              paragraphDescription:
                'Absents himself from any place where he is required to be or is present at any place where he is not authorised to be',
              paragraphNumber: '20',
            },
          ],
          offenceTitle:
            'Being absent without authorisation, being in an unauthorised place, or failing to work correctly',
        },
        {
          offenceRules: [
            {
              childQuestion: 'Disobeys any lawful order, or failure to comply with any rule or regulation',
              paragraphDescription: 'Disobeys any lawful order',
              paragraphNumber: '25',
            },
          ],
          offenceTitle: 'Disobeys any lawful order, or failure to comply with any rule or regulation',
        },
      ]
      const result = getOffenceInformation(allOffenceRules, true, 1)
      expect(result).toEqual(expectedResult)
    })
  })
})
