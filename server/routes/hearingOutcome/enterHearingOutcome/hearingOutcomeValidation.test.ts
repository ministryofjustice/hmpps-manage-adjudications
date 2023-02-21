import { HearingOutcomeCode } from '../../../data/HearingAndOutcomeResult'
import validateForm from './hearingOutcomeValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        hearingOutcome: HearingOutcomeCode.COMPLETE,
        adjudicatorName: 'Roxanne Red',
      })
    ).toBeNull()
  })
  it('shows error when hearing outcome is missing', () => {
    expect(
      validateForm({
        hearingOutcome: '',
        adjudicatorName: 'Roxanne Red',
      })
    ).toEqual({
      href: '#hearingOutcome',
      text: 'Select the next step after this hearing',
    })
  })
  it('shows error when adjudicator name is missing', () => {
    expect(
      validateForm({
        hearingOutcome: HearingOutcomeCode.COMPLETE,
        adjudicatorName: '',
      })
    ).toEqual({
      href: '#adjudicatorName',
      text: 'Enter the name of the adjudicator',
    })
  })
})
