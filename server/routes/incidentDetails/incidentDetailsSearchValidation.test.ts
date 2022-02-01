import validateForm from './incidentDetailsSearchValidation'

describe('validateForm', () => {
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(validateForm({ searchTerm: 'G6123VU', inputId: 'inciteAnotherPrisoner' })).toBeNull()
    })
  })
  describe('Invalid submit shows errors', () => {
    it('returns the expected response for missing search term - inciting another prisoner', () => {
      expect(validateForm({ searchTerm: '', inputId: 'inciteAnotherPrisoner' })).toEqual({
        href: '#inciteAnotherPrisonerInput',
        text: 'Enter a prisoner’s name or number',
      })
    })
    it('returns the expected response for missing search term - assisting another prisoner', () => {
      expect(validateForm({ searchTerm: '', inputId: 'assistAnotherPrisoner' })).toEqual({
        href: '#assistAnotherPrisonerInput',
        text: 'Enter a prisoner’s name or number',
      })
    })
  })
})
