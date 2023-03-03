import validateForm from './damagesOwedValidation'

describe('validateForm', () => {
  it('Valid submit - yes owed', () => {
    expect(
      validateForm({
        damagesOwed: 'yes',
        amount: '123.4',
      })
    ).toBeNull()
  })
  it('Valid submit - no owed', () => {
    expect(
      validateForm({
        damagesOwed: 'no',
        amount: null,
      })
    ).toBeNull()
  })
  it('shows error when no damages owed option selected', () => {
    expect(
      validateForm({
        damagesOwed: null,
        amount: null,
      })
    ).toEqual({
      href: '#damagesOwed',
      text: 'Select yes, if any money is being recovered for damages.',
    })
  })
  it('shows error when no amount entered', () => {
    expect(
      validateForm({
        damagesOwed: 'yes',
        amount: null,
      })
    ).toEqual({
      href: '#amount',
      text: 'Enter amount being recovered.',
    })
  })
  it('shows error when amount is not a number', () => {
    expect(
      validateForm({
        damagesOwed: 'yes',
        amount: '1t3.4t',
      })
    ).toEqual({
      href: '#amount',
      text: 'Numerical values only.',
    })
  })
})
