import { HearingOutcomeAdjournReason, HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import { wordLimitExceedingString } from '../../../utils/utils'
import validateForm from './hearingAdjournValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        adjournReason: HearingOutcomeAdjournReason.EVIDENCE,
        adjournDetails: 'details',
        adjournPlea: HearingOutcomePlea.ABSTAIN,
      })
    ).toBeNull()
  })
  it('shows error when the reason is missing', () => {
    expect(
      validateForm({
        adjournReason: null,
        adjournDetails: 'details',
        adjournPlea: HearingOutcomePlea.ABSTAIN,
      })
    ).toEqual({
      href: '#adjournReason',
      text: 'Enter the reason for the adjournment',
    })
  })
  it('shows error when the details is missing', () => {
    expect(
      validateForm({
        adjournReason: HearingOutcomeAdjournReason.EVIDENCE,
        adjournDetails: '',
        adjournPlea: HearingOutcomePlea.ABSTAIN,
      })
    ).toEqual({
      href: '#adjournDetails',
      text: 'Enter the details for the adjournment',
    })
  })
  it('shows error when the plea is missing', () => {
    expect(
      validateForm({
        adjournReason: HearingOutcomeAdjournReason.EVIDENCE,
        adjournDetails: 'details',
        adjournPlea: null,
      })
    ).toEqual({
      href: '#adjournPlea',
      text: 'Select the plea for the offence',
    })
  })
  it('character count - returns the expected response for a valid submit', () => {
    expect(
      validateForm({
        adjournReason: HearingOutcomeAdjournReason.EVIDENCE,
        adjournDetails: 'blah blah',
        adjournPlea: HearingOutcomePlea.ABSTAIN,
      })
    ).toBeNull()
  })
  it('character count - returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        adjournReason: HearingOutcomeAdjournReason.EVIDENCE,
        adjournDetails: wordLimitExceedingString,
        adjournPlea: HearingOutcomePlea.ABSTAIN,
      })
    ).toStrictEqual({
      href: '#adjournDetails',
      text: 'Your statement must be 4,000 characters or fewer',
    })
  })
})
