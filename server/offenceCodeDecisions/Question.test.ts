/* eslint-disable */
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
    // Expect find to throw when more than one match
    expect(() => template().findQuestionBy(question => question.id().startsWith('1-1'))).toThrow()
    // Expect find to return the correct value when there is only one match.
    expect(
      template()
        .findQuestionBy(question => question.id() === '1-1')
        .id()
    ).toEqual('1-1')
    // Expect find to return null if there are no matches
    expect(template().findQuestionBy(question => question.id() === 'none_existent_id')).toBe(null)
  })

  it('answer', () => {
    // Expect find to throw when more than one match
    expect(() => template().findAnswerBy(answer => answer.id().startsWith('1-1'))).toThrow()
    // Expect find to return the correct value when there is only one match.
    expect(
      template()
        .findAnswerBy(answer => answer.id() === '1-1')
        .id()
    ).toEqual('1-1')
    // Expect find to return null if there are no matches
    expect(template().findAnswerBy(answer => answer.id() === 'none_existent_id')).toBe(null)
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
    // Match should bring back all matches
    const matching = template().matchingQuestions(question => question.id().startsWith('1-1'))
    expect(matching.map(question => question.id()).sort()).toEqual(['1-1', '1-1-2'])
  })

  it('answers', () => {
    // Match should bring back all matches
    const matching = template().matchingAnswers(answer => answer.id().startsWith('1-1'))
    expect(matching.map(answer => answer.id()).sort()).toEqual(['1-1', '1-1-1', '1-1-2', '1-1-2-1'])
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

describe('all ids', () => {
  it('all ids', () => {
    const list = template().allIds()
    expect(list.sort()).toEqual(['1', '1-1', '1-1-2', '1-2'])
  })
})
