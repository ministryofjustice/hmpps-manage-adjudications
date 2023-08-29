import validateForm from './govReasonForReferralValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        referralReason: "Referring back to the gov because I don't know what to do",
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
})
