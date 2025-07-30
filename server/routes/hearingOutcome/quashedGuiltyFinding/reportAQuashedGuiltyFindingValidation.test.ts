import { QuashGuiltyFindingReason } from '../../../data/HearingAndOutcomeResult'
import { wordLimitExceedingString } from '../../../utils/utils'
import validateForm from './reportAQuashedGuiltyFindingValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        quashReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
        quashDetails: 'Some details about the reason for quashing the guilty finding',
      }),
    ).toBeNull()
  })
  it('shows error when the reason is missing', () => {
    expect(
      validateForm({
        quashReason: '',
        quashDetails: 'Some details about the reason for quashing the guilty finding',
      }),
    ).toEqual({
      href: '#quashReason',
      text: 'Select why the guilty finding was quashed',
    })
  })
  it('shows error when the details is missing', () => {
    expect(
      validateForm({
        quashReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
        quashDetails: '',
      }),
    ).toEqual({
      href: '#quashDetails',
      text: 'Enter more details',
    })
  })
  it('character count - returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        quashReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
        quashDetails: wordLimitExceedingString,
      }),
    ).toStrictEqual({
      href: '#quashDetails',
      text: 'Your statement must be 4,000 characters or fewer',
    })
  })
})
