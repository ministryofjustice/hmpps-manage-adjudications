import validateForm from './prisonerSearchValidation'

describe('validateForm', () => {
  describe('searchTerm', () => {
    it('valid', () => {
      expect(validateForm({ searchTerm: 'Smith' })).toBeNull()
    })

    it('invalid', () => {
      expect(validateForm({ searchTerm: '' })).toStrictEqual({
        href: '#searchTerm',
        text: 'Enter the prisoner’s name or number',
      })
    })
  })
})
