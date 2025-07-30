import validateForm from './policeReasonForReferralValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        referralReason: 'This is a very serious offence which needs the police.',
      }),
    ).toBeNull()
  })
  it('shows error when the reason is missing', () => {
    expect(
      validateForm({
        referralReason: '',
      }),
    ).toEqual({
      href: '#referralReason',
      text: 'Enter the reason for the referral',
    })
  })
})
