import validateForm from './createOnBehalfOfReasonValidation'

describe('validateForm', () => {
  it('Valid submit', () => {
    expect(validateForm('some reason')).toBeNull()
  })

  it('shows error when no reason provided', () => {
    expect(validateForm(null)).toStrictEqual({
      href: '#createdOnBehalfOfReason',
      text: 'Enter the reason why you are reporting this on their behalf',
    })
  })
})
