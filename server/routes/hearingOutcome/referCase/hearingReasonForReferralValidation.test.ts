import { wordLimitExceedingString } from '../../../utils/utils'
import validateForm from './hearingReasonForReferralValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        referralReason: 'This is a very serious offence which needs the police.',
      })
    ).toBeNull()
  })
  it('shows error when the reason is missing', () => {
    expect(
      validateForm({
        referralReason: '',
      })
    ).toEqual({
      href: '#referralReason',
      text: 'Enter the reason for the referral',
    })
  })
  it('returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        referralReason: wordLimitExceedingString,
      })
    ).toStrictEqual({
      href: '#referralReason',
      text: 'Your statement must be 4,000 characters or fewer',
    })
  })
})
