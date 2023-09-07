import validateForm from './createOnBehalfOfValidation'

describe('validateForm', () => {
  it('Valid submit', () => {
    expect(validateForm('some officer')).toBeNull()
  })

  it('shows error when no officer provided', () => {
    expect(validateForm(null)).toStrictEqual({
      href: '#createdOnBehalfOfOfficer',
      text: 'Enter the new reporting officers name',
    })
  })
})
