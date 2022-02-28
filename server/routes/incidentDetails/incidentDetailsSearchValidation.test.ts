import validateForm from './incidentDetailsSearchValidation'

describe('validateForm', () => {
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(validateForm({ searchTerm: 'G6123VU', inputId: 'incited' })).toBeNull()
    })
  })
  describe('Invalid submit shows errors', () => {
    it('returns the expected response for missing search term - inciting another prisoner', () => {
      expect(validateForm({ searchTerm: '', inputId: 'incited' })).toEqual({
        href: '#incitedInput',
        text: 'Enter a prisoner’s name or number',
      })
    })
    it('returns the expected response for missing search term - assisting another prisoner', () => {
      expect(validateForm({ searchTerm: '', inputId: 'assisted' })).toEqual({
        href: '#assistedInput',
        text: 'Enter a prisoner’s name or number',
      })
    })
  })
})
