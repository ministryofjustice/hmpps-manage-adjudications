import validateForm from './manualEntryConsecutivePunishmentValidation'

describe('validateForm', () => {
  it('Valid submit', () => {
    expect(
      validateForm({
        consecutiveChargeNumber: '1234567',
      })
    ).toBeNull()
  })
  it("shows error when the input isn't only numbers", () => {
    expect(
      validateForm({
        consecutiveChargeNumber: '1aaaaaa',
      })
    ).toEqual({
      href: '#consecutiveChargeNumber',
      text: 'Charge number must only include numbers',
    })
  })
  it("shows error when a user hasn't entered a charge", () => {
    // @ts-expect-error: Ignore the type error as it is required for test
    expect(validateForm({})).toEqual({
      href: '#consecutiveChargeNumber',
      text: 'Enter a charge number',
    })
  })
  it('shows error when the charge is not 7 numbers long', () => {
    expect(
      validateForm({
        consecutiveChargeNumber: '12345',
      })
    ).toEqual({
      href: '#consecutiveChargeNumber',
      text: 'Charge number must be 7 numbers long',
    })
  })
})
