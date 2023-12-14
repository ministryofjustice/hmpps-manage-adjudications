import validateForm from './createOnBehalfOfValidation'

describe('validateForm', () => {
  it('Valid submit', () => {
    expect(validateForm('some officer')).toBeNull()
  })

  it('shows error when no officer provided', () => {
    expect(validateForm(null)).toStrictEqual({
      href: '#createdOnBehalfOfOfficer',
      text: 'Enter the new reporting officer’s name',
    })
  })
  it('shows error when officer name is too long', () => {
    expect(validateForm('5AVKTfJ2YZ4sn3cQcukF8lw9VU8OWkngq')).toStrictEqual({
      href: '#createdOnBehalfOfOfficer',
      text: 'The reporting officer’s name must be less than 32 characters',
    })
  })
})
