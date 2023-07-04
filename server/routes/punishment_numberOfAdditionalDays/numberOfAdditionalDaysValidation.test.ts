import validateForm from './numberOfAdditionalDaysValidation'

describe('validateForm', () => {
  it('Valid submit when prospective days', () => {
    expect(
      validateForm({
        days: 10,
      })
    ).toBeNull()
  })

  it('Valid submit when additional days', () => {
    expect(
      validateForm({
        days: 10,
      })
    ).toBeNull()
  })
  it('shows error when no days select', () => {
    expect(
      validateForm({
        days: null,
      })
    ).toEqual({
      href: '#days',
      text: 'Enter how many days the punishment will last',
    })
  })
  it('shows error when too few days are entered', () => {
    expect(
      validateForm({
        days: 0,
      })
    ).toEqual({
      href: '#days',
      text: 'Enter one or more days',
    })
  })
})
