import validateForm from './cautionValidation'

describe('validateForm', () => {
  it('Valid submit - yes its a caution', () => {
    expect(
      validateForm({
        caution: 'yes',
      })
    ).toBeNull()
  })

  it('shows error when no caution option selected', () => {
    expect(
      validateForm({
        caution: null,
      })
    ).toEqual({
      href: '#caution',
      text: 'Select yes if the punishment is a caution',
    })
  })
})
