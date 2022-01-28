import validateForm from './staffSearchValidation'

describe('validateForm', () => {
  describe('first and last names', () => {
    it('valid', () => {
      expect(validateForm({ staffFirstName: 'John', staffLastName: 'Smith' })).toBeNull()
    })

    it('invalid - both names', () => {
      expect(validateForm({ staffFirstName: '', staffLastName: '' })).toStrictEqual({
        href: '#searchFullName',
        text: 'Enter their name',
      })
    })
    it('invalid - first name', () => {
      expect(validateForm({ staffFirstName: '', staffLastName: 'Smith' })).toStrictEqual({
        href: '#staffFirstName',
        text: 'Enter their first name',
      })
    })
    it('invalid - last names', () => {
      expect(validateForm({ staffFirstName: 'John', staffLastName: '' })).toStrictEqual({
        href: '#staffLastName',
        text: 'Enter their last name',
      })
    })
  })
})
