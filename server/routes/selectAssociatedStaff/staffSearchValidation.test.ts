import validateForm from './staffSearchValidation'

describe('validateForm', () => {
  it('valid', () => {
    expect(validateForm({ staffName: 'Samuel Smith' })).toBeNull()
  })
  it('invalid', () => {
    expect(validateForm({ staffName: '' })).toStrictEqual({
      href: '#staffName',
      text: 'Enter the person’s name',
    })
  })
})
