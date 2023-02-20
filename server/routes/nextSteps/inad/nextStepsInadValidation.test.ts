import validateForm from './nextStepsInadValidation'

describe('validateForm', () => {
  it('Valid submit', () => {
    expect(
      validateForm({
        nextStepChosen: 'schedule_hearing',
      })
    ).toBeNull()
  })
  it('shows error when no prosecution option selected', () => {
    expect(
      validateForm({
        nextStepChosen: null,
      })
    ).toEqual({
      href: '#nextStepChosen',
      text: 'Select the next step',
    })
  })
})
