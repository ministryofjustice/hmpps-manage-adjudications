/* eslint-disable */
import { AnswerType, Answer } from './Answer'
import { answer, question } from './Decisions'

function template() {
  return question('question 1')
    .child(
      answer('answer 1-1').child(
        question('question 1-1')
          .child(answer('answer 1-1-1').offenceCode(1))
          .child(answer('answer 1-1-2').child(question('answer 1-1-2').child(answer('answer 1-1-2-1').offenceCode(2))))
      )
    )
    .child(answer('answer 1-2').child(question('question 1-2').child(answer('answer 1-2-1').offenceCode(3))))
}

describe('find', () => {
  it('question', () => {
    const withUniqueUrl = template()
    withUniqueUrl.getChildAnswers()[0].getChildQuestion().url('unique')
    const withNonUniqueUrl = template()
    withNonUniqueUrl.getChildAnswers()[0].getChildQuestion().url('non-unique')
    withNonUniqueUrl.getChildAnswers()[1].getChildQuestion().url('non-unique')

    expect(() => withNonUniqueUrl.findQuestionBy(d => d.getUrl() === 'non-unique')).toThrow()
    expect(withUniqueUrl.findQuestionBy(d => d.getUrl() === 'unique').getUrl()).toEqual('unique')
    expect(template().findQuestionBy(d => d.getUrl() === 'a-url-that-does-not-exist')).toBe(null)
  })

  it('answer', () => {
    const withNoStaffAnswers = template()
    const withSingleStaffAnswer = template()
    withSingleStaffAnswer.getChildAnswers()[0].getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    const withMultipleStaffAnswers = template()
    withMultipleStaffAnswers.getChildAnswers()[0].getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    withMultipleStaffAnswers.getChildAnswers()[1].getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    const matchByStaffType = (a: Answer) => a.getType() === AnswerType.STAFF

    expect(() => withMultipleStaffAnswers.findAnswerBy(matchByStaffType)).toThrow()
    expect(withSingleStaffAnswer.findAnswerBy(matchByStaffType).getType()).toEqual(AnswerType.STAFF)
    expect(withNoStaffAnswers.findAnswerBy(matchByStaffType)).toBe(null)
  })

  it('question by url', () => {
    const withUniqueUrl = template()
    withUniqueUrl.getChildAnswers()[0].getChildQuestion().url('override-url')
    expect(withUniqueUrl.findQuestionByUrl('override-url').id()).toEqual('1-1')
    expect(withUniqueUrl.findQuestionByUrl('1-1')).toBe(null) // expect the overridden url to take preference
  })

  it('question by id', () => {
    expect(template().findQuestionById('1-2').id()).toEqual('1-2')
  })

  it('answer by id', () => {
    expect(template().findAnswerById('1-2').id()).toEqual('1-2')
  })

  it('answer by code', () => {
    expect(template().findAnswerByCode(3).getOffenceCode()).toEqual(3)
  })
})

describe('match', () => {
  it('questions', () => {
    const withNonUniqueUrl = template()
    withNonUniqueUrl.getChildAnswers()[0].getChildQuestion().url('non-unique')
    withNonUniqueUrl.getChildAnswers()[1].getChildQuestion().url('non-unique')
    const matching = withNonUniqueUrl.matchingQuestions(d => d.getUrl() === 'non-unique')
    expect(matching).toHaveLength(2)
  })

  it('answers', () => {
    const withMultipleStaffAnswers = template()
    withMultipleStaffAnswers.getChildAnswers()[0].getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    withMultipleStaffAnswers.getChildAnswers()[1].getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    const matchByStaffType = (a: Answer) => a.getType() === AnswerType.STAFF

    expect(withMultipleStaffAnswers.matchingAnswers(matchByStaffType)).toHaveLength(2)
  })
})

describe('id', () => {
  it('id', () => {
    // Note id is based on position in child arrays.
    expect(template().getChildAnswers()[1].getChildQuestion().id()).toEqual('1-2')
  })

  it('is unique', () => {
    const list = template()
      .matchingQuestions(a => true) // Bring back everything
      .map(q => q.id())
    const duplicatesRemoved = new Set(list)
    expect(list.length).toBeGreaterThan(0)
    expect(list).toHaveLength(duplicatesRemoved.size)
  })
})

describe('all codes', () => {
  it('all code', () => {
    const list = template().allCodes()
    expect(list.sort()).toEqual([1, 2, 3])
  })
})

describe('all urls', () => {
  it('all urls', () => {
    const list = template().allUrls()
    const duplicatesRemoved = new Set(list)
    expect(list.sort()).toEqual(['1', '1-1', '1-1-2', '1-2'])
  })
})
