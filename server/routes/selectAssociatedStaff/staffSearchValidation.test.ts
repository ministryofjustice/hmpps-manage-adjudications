import validateForm from './staffSearchValidation'

describe('validateForm', () => {
  describe('first and last names', () => {
    it('valid', () => {
      expect(validateForm({ staffFirstName: 'John', staffLastName: 'Smith' })).toBeNull()
    })

    it('invalid - both names', () => {
      expect(validateForm({ staffFirstName: '', staffLastName: '' })).toStrictEqual({
        href: '#staffFullName',
        text: 'Enter the person’s name',
      })
    })
    it('invalid - first name', () => {
      expect(validateForm({ staffFirstName: '', staffLastName: 'Smith' })).toStrictEqual({
        href: '#staffFirstName',
        text: 'Enter the person’s first name',
      })
    })
    it('invalid - last names', () => {
      expect(validateForm({ staffFirstName: 'John', staffLastName: '' })).toStrictEqual({
        href: '#staffLastName',
        text: 'Enter the person’s last name',
      })
    })
  })
})
