import validateForm from './manualEntryConsecutivePunishmentValidation'

describe('validateForm', () => {
  it('Valid submit', () => {
    expect(
      validateForm({
        chargeNumber: 1234567,
      })
    ).toBeNull()
  })
  it("shows error when the input isn't only numbers", () => {
    expect(
      validateForm({
        // @ts-expect-error: Ignore the type error as it is required for test
        chargeNumber: '1aaaaaa',
      })
    ).toEqual({
      href: '#chargeNumber',
      text: 'Charge number must only include numbers',
    })
  })
  it("shows error when a user hasn't entered a charge", () => {
    // @ts-expect-error: Ignore the type error as it is required for test
    expect(validateForm({})).toEqual({
      href: '#chargeNumber',
      text: 'Enter a charge number',
    })
  })
  it('shows error when the charge is not 7 numbers long', () => {
    expect(
      validateForm({
        chargeNumber: 12345,
      })
    ).toEqual({
      href: '#chargeNumber',
      text: 'Charge number must be 7 numbers long',
    })
  })
})
