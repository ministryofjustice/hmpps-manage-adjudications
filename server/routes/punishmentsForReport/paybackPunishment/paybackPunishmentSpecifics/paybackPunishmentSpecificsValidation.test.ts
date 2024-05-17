import validateForm from './paybackPunishmentSpecificsValidation'

describe('', () => {
  it('Valid submit returns null - true', () => {
    expect(validateForm({ paybackSpecificsChoice: true })).toBeNull()
  })
  it('Valid submit returns null - false', () => {
    expect(validateForm({ paybackSpecificsChoice: false })).toBeNull()
  })
  it('Missing choice triggers validation', () => {
    expect(validateForm({ paybackSpecificsChoice: undefined })).toEqual({
      href: '#paybackPunishmentSpecifics',
      text: 'Select yes if you have the details of the payback punishment',
    })
  })
})
