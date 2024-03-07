import { ReferGovReason } from '../../../../data/HearingAndOutcomeResult'
import validateForm from './govReasonForReferralValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        referralReason: "Referring back to the gov because I don't know what to do",
        referGovReason: ReferGovReason.NOT_SERIOUS_FOR_INAD,
      })
    ).toBeNull()
  })
  it('shows error when the comments are missing', () => {
    expect(
      validateForm({
        referralReason: '',
        referGovReason: ReferGovReason.GOV_INQUIRY,
      })
    ).toEqual({
      href: '#referralReason',
      text: 'Enter the adjudicator’s comments about the referral',
    })
  })
  it('shows error when the gov referral reason is missing', () => {
    expect(
      validateForm({
        referralReason: 'I am unsure',
        referGovReason: undefined,
      })
    ).toEqual({
      href: '#referGovReason',
      text: 'Enter the reason for the referral',
    })
  })
})
