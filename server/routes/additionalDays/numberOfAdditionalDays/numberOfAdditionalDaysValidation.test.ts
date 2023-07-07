import validateForm from './numberOfAdditionalDaysValidation'

describe('validateForm', () => {
  it('Valid submit when days correct', () => {
    expect(
      validateForm({
        days: 10,
      })
    ).toBeNull()
  })
  it('shows error when no days entered', () => {
    expect(
      validateForm({
        days: null,
      })
    ).toEqual({
      href: '#days',
      text: 'Enter how many days the punishment will last',
    })
  })
  it('shows error when something other than a number is entered', () => {
    expect(
      validateForm({
        // @ts-expect-error: Ignore typecheck here
        days: 'hello',
      })
    ).toEqual({
      href: '#days',
      text: 'Enter a number of days',
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
