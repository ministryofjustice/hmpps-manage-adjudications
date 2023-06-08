import validateForm from './isPrisonerStillInEstablishmentValidation'

describe('prisoner in establishment validation', () => {
  it('Valid submit shows no error', () => {
    expect(validateForm({ stillInEstablishment: 'true' })).toBeNull()
  })
  it('Valid submit shows no error', () => {
    expect(validateForm({ stillInEstablishment: 'false' })).toBeNull()
  })
  it('Shows error on an invalid submit where there is a missing radio button selection', () => {
    expect(validateForm({ stillInEstablishment: '' })).toEqual({
      href: '#stillInEstablishment',
      text: 'Select yes if the prisoner is still in this establishment',
    })
  })
})
