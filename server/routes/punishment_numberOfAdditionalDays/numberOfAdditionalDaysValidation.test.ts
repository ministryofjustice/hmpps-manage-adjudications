import validateForm from './numberOfAdditionalDaysValidation'

describe('validateForm', () => {
  it('Valid submit when days correct', () => {
    expect(
      validateForm({
        numberOfDays: 10,
      })
    ).toBeNull()
  })
  it('shows error when no days entered', () => {
    expect(
      validateForm({
        numberOfDays: null,
      })
    ).toEqual({
      href: '#numberOfDays',
      text: 'Enter how many days the punishment will last',
    })
  })
  it('shows error when something other than a number is entered', () => {
    expect(
      validateForm({
        // @ts-expect-error: Ignore typecheck here
        numberOfDays: 'hello',
      })
    ).toEqual({
      href: '#numberOfDays',
      text: 'Enter a number of days',
    })
  })
  it('shows error when too few days are entered', () => {
    expect(
      validateForm({
        numberOfDays: 0,
      })
    ).toEqual({
      href: '#numberOfDays',
      text: 'Enter one or more days',
    })
  })
})
