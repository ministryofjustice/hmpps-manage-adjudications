import validateForm from './staffSearchValidation'

describe('validateForm', () => {
  describe('first and last names', () => {
    it('valid', () => {
      expect(validateForm({ searchFirstName: 'John', searchLastName: 'Smith' })).toBeNull()
    })

    it('invalid - both names', () => {
      expect(validateForm({ searchFirstName: '', searchLastName: '' })).toStrictEqual({
        href: '#searchFullName',
        text: 'Enter their name',
      })
    })
    it('invalid - first name', () => {
      expect(validateForm({ searchFirstName: '', searchLastName: 'Smith' })).toStrictEqual({
        href: '#searchFirstName',
        text: 'Enter their first name',
      })
    })
    it('invalid - last names', () => {
      expect(validateForm({ searchFirstName: 'John', searchLastName: '' })).toStrictEqual({
        href: '#searchLastName',
        text: 'Enter their last name',
      })
    })
  })
})
