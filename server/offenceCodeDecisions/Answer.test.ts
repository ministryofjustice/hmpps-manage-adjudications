/* eslint-disable */
import { AnswerType, Answer } from './Answer'
import { answer, question } from './Decisions'

function template() {
    return question('question 1')
      .child(answer('answer 1-1')
        .child(question('question 1-1')
          .child(answer('answer 1-1-1').offenceCode(1))
          .child(answer('answer 1-1-2')
            .child(question('answer 1-1-2')
            .child(answer('answer 1-1-2-1').offenceCode(2))))))
}

function templateFirstAnswer() {
  return template().getChildAnswers()[0]
}

describe('find', () => {
  it('answer', () => {
    const withNoStaffAnswers = templateFirstAnswer()
    const withSingleStaffAnswer = templateFirstAnswer()
    withSingleStaffAnswer.getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    const withMultipleStaffAnswers = templateFirstAnswer()
    withMultipleStaffAnswers.getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    withMultipleStaffAnswers.getChildQuestion().getChildAnswers()[1].type(AnswerType.STAFF)
    const matchByStaffType = (a: Answer) => a.getType() === AnswerType.STAFF

    expect(() => withMultipleStaffAnswers.findAnswerBy(matchByStaffType)).toThrow()
    expect(withSingleStaffAnswer.findAnswerBy(matchByStaffType).getType()).toEqual(AnswerType.STAFF)
    expect(withNoStaffAnswers.findAnswerBy(matchByStaffType)).toBe(null)
  })
})

describe('match', () => {
  it('answers', () => {
    const withMultipleStaffAnswers = templateFirstAnswer()
    withMultipleStaffAnswers.getChildQuestion().getChildAnswers()[0].type(AnswerType.STAFF)
    withMultipleStaffAnswers.getChildQuestion().getChildAnswers()[1].type(AnswerType.STAFF)
    const matchByStaffType = (a: Answer) => a.getType() === AnswerType.STAFF

    expect(withMultipleStaffAnswers.matchingAnswers(matchByStaffType)).toHaveLength(2)
  })
})

describe('id', () => {
  it('answer', () => {
    // Note id is based on position in child arrays.
    expect(templateFirstAnswer().getChildQuestion().getChildAnswers()[1].id()).toEqual('1-1-2')
  })

  it('is unique', () => {
    const list = templateFirstAnswer()
      .matchingAnswers(a => true) // Bring back everything
      .map(a => a.id())
    const duplicatesRemoved = new Set(list)
    expect(list.length).toBeGreaterThan(0)
    expect(list).toHaveLength(duplicatesRemoved.size)
  })
})

describe('all codes', () => {
  it('all code', () => {
    const list = templateFirstAnswer().allCodes()
    expect(list.sort()).toEqual([1, 2])
  })
})

describe('questions and answers to get here', () => {
  it('questions and answers to get here', () => {
    const questionsAndAnswers = template().findAnswerByCode(2).getQuestionsAndAnswersToGetHere()
    expect(questionsAndAnswers).toHaveLength(3)
    expect(questionsAndAnswers[0].question.id()).toEqual('1')
    expect(questionsAndAnswers[0].answer.id()).toEqual('1-1')
    expect(questionsAndAnswers[1].question.id()).toEqual('1-1')
    expect(questionsAndAnswers[1].answer.id()).toEqual('1-1-2')
    expect(questionsAndAnswers[2].question.id()).toEqual('1-1-2')
    expect(questionsAndAnswers[2].answer.id()).toEqual('1-1-2-1')
  })
})