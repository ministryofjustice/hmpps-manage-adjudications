import { HearingOutcomeCode } from '../../../data/HearingAndOutcomeResult'
import { OicHearingType } from '../../../data/ReportedAdjudicationResult'
import validateForm from './hearingOutcomeValidation'

describe('validateForm', () => {
  it('Valid submit (governor) has no errors', () => {
    expect(
      validateForm({
        inAdName: null,
        hearingOutcome: HearingOutcomeCode.COMPLETE,
        governorId: 'RSWANSON_GEN',
        adjudicatorType: OicHearingType.GOV_ADULT,
      })
    ).toBeNull()
  })
  it('Valid submit (inad) has no errors', () => {
    expect(
      validateForm({
        hearingOutcome: HearingOutcomeCode.COMPLETE,
        inAdName: 'Roxanne Red',
        governorId: null,
        adjudicatorType: OicHearingType.INAD_ADULT,
      })
    ).toBeNull()
  })
  it('shows error when hearing outcome is missing', () => {
    expect(
      validateForm({
        hearingOutcome: '',
        inAdName: null,
        governorId: 'RSWANSON_GEN',
        adjudicatorType: OicHearingType.GOV_ADULT,
      })
    ).toEqual({
      href: '#hearingOutcome',
      text: 'Select the next step after this hearing',
    })
  })
  it('shows error when adjudicator name is missing - inAd', () => {
    expect(
      validateForm({
        hearingOutcome: HearingOutcomeCode.COMPLETE,
        adjudicatorType: OicHearingType.INAD_ADULT,
        inAdName: null,
        governorId: null,
      })
    ).toEqual({
      href: '#inAdName',
      text: 'Enter the name of the adjudicator',
    })
  })
  it('shows error when governor id is missing - gov', () => {
    expect(
      validateForm({
        hearingOutcome: HearingOutcomeCode.COMPLETE,
        adjudicatorType: OicHearingType.GOV_ADULT,
        inAdName: null,
        governorId: null,
      })
    ).toEqual({
      href: '#governorName',
      text: 'Search for a governor',
    })
  })
})
