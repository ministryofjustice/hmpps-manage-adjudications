import validateForm from './willPunishmentBeConsecutiveValidation'

describe('validateForm', () => {
  it('Valid submit user has chosen a radio', () => {
    expect(
      validateForm({
        consecutive: 'yes',
      }),
    ).toBeNull()
  })
  it('shows error when no radio is chosen', () => {
    expect(
      validateForm({
        consecutive: null,
      }),
    ).toEqual({
      href: '#consecutive',
      text: 'Select yes if this punishment is consecutive to another punishment',
    })
  })
})
