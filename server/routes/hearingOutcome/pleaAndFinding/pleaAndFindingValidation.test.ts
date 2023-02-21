import { HearingOutcomeFinding, HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import validateForm from './pleaAndFindingValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        hearingFinding: HearingOutcomeFinding.DISMISSED,
        hearingPlea: HearingOutcomePlea.ABSTAIN,
      })
    ).toBeNull()
  })
  it('shows error when the plea is missing', () => {
    expect(
      validateForm({
        hearingFinding: HearingOutcomeFinding.DISMISSED,
        hearingPlea: '',
      })
    ).toEqual({
      href: '#hearingPlea',
      text: 'Select a plea',
    })
  })
  it('shows error when the finding is missing', () => {
    expect(
      validateForm({
        hearingFinding: '',
        hearingPlea: HearingOutcomePlea.ABSTAIN,
      })
    ).toEqual({
      href: '#hearingFinding',
      text: 'Select a finding',
    })
  })
})
