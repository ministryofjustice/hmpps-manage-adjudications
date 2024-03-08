import { ReferGovReason } from '../../../data/HearingAndOutcomeResult'
import { wordLimitExceedingString } from '../../../utils/utils'
import validateForm from './hearingReasonForReferralValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        referralReason: 'This is a very serious offence which needs the police.',
        referGovReasonPresent: false,
        referGovReason: undefined,
      })
    ).toBeNull()
  })
  it('shows error when the reason is missing - police referral', () => {
    expect(
      validateForm({
        referralReason: '',
        referGovReasonPresent: false,
        referGovReason: undefined,
      })
    ).toEqual({
      href: '#referralReason',
      text: 'Enter the reason for the referral',
    })
  })
  it('shows error when the reason is missing - gov referral', () => {
    expect(
      validateForm({
        referralReason: '',
        referGovReasonPresent: true,
        referGovReason: ReferGovReason.GOV_INQUIRY,
      })
    ).toEqual({
      href: '#referralReason',
      text: 'Enter the adjudicator’s comments about the referral',
    })
  })
  it('shows error when the refer to gov reason is missing and it should be there', () => {
    expect(
      validateForm({
        referralReason: '',
        referGovReasonPresent: true,
        referGovReason: undefined,
      })
    ).toEqual({
      href: '#referGovReason',
      text: 'Enter the reason for the referral',
    })
  })
  it('returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        referralReason: wordLimitExceedingString,
        referGovReasonPresent: false,
        referGovReason: undefined,
      })
    ).toStrictEqual({
      href: '#referralReason',
      text: 'Your statement must be 4,000 characters or fewer',
    })
  })
})
