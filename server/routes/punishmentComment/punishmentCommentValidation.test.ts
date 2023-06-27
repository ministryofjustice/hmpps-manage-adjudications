import { wordLimitExceedingString } from '../../utils/utils'
import validateForm from './punishmentCommentValidation'

describe('validateForm', () => {
  it('Valid submit has no errors when comment is not blank', () => {
    expect(
      validateForm({
        punishmentComment: 'some text',
      })
    ).toBeNull()
  })
  it('shows error when no punishment comment is not blank', () => {
    expect(
      validateForm({
        punishmentComment: '  ',
      })
    ).toEqual({
      href: '#punishmentComment',
      text: 'Enter a comment',
    })
  })
  it('characters count - returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        punishmentComment: wordLimitExceedingString,
      })
    ).toStrictEqual({
      href: '#punishmentComment',
      text: 'Your comment must be 4,000 characters or fewer',
    })
  })
})
