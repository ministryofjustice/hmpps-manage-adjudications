import validateForm from './ageOfPrisonerValidation'

describe('Age of prisoner validation', () => {
  it('Valid submit shows no error', () => {
    expect(validateForm({ whichRuleChosen: 'yoi' })).toBeNull()
  })
  it('Shows error on an invalid submit where there is a missing radio button selection', () => {
    expect(validateForm({ whichRuleChosen: '' })).toEqual({
      href: '#whichRuleChosen',
      text: 'Select which rules apply.',
    })
  })
})
