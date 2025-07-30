import validateForm from './nextStepsPoliceValidation'

describe('validateForm', () => {
  it('Valid submit has no errors if Yes to prosecution', () => {
    expect(
      validateForm({
        prosecutionChosen: 'yes',
        nextStepChosen: null,
      }),
    ).toBeNull()
  })
  it('Valid submit has no errors if no to prosecution', () => {
    expect(
      validateForm({
        prosecutionChosen: 'no',
        nextStepChosen: 'schedule_hearing',
      }),
    ).toBeNull()
  })
  it('shows error when no prosecution option selected', () => {
    expect(
      validateForm({
        prosecutionChosen: null,
        nextStepChosen: null,
      }),
    ).toEqual({
      href: '#prosecutionChosen',
      text: 'Select yes if this charge will continue to prosecution',
    })
  })
  it('shows error when no next step selected', () => {
    expect(
      validateForm({
        prosecutionChosen: 'no',
        nextStepChosen: null,
      }),
    ).toEqual({
      href: '#nextStepChosen',
      text: 'Select the next step',
    })
  })
})
