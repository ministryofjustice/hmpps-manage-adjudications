import validateForm from './reasonForFindingValidation'
import { wordLimitExceedingString } from '../../../utils/utils'

describe('Character count exceeded', () => {
  it('returns the expected response for a valid submit', () => {
    expect(
      validateForm({
        reasonForFinding: 'blah blah',
      }),
    ).toBeNull()
  })
  it('returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        reasonForFinding: wordLimitExceedingString,
      }),
    ).toStrictEqual({
      href: '#reasonForFinding',
      text: 'Your statement must be 4,000 characters or fewer',
    })
  })
})
