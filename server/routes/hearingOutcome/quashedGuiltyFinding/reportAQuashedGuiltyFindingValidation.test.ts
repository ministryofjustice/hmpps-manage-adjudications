import { QuashGuiltyFindingReason } from '../../../data/HearingAndOutcomeResult'
import validateForm from './reportAQuashedGuiltyFindingValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        quashReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
        quashDetails: 'Some details about the reason for quashing the guilty finding',
      })
    ).toBeNull()
  })
  it('shows error when the reason is missing', () => {
    expect(
      validateForm({
        quashReason: '',
        quashDetails: 'Some details about the reason for quashing the guilty finding',
      })
    ).toEqual({
      href: '#quashReason',
      text: 'Select why the guilty finding was quashed',
    })
  })
  it('shows error when teh details is missing', () => {
    expect(
      validateForm({
        quashReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
        quashDetails: '',
      })
    ).toEqual({
      href: '#quashDetails',
      text: 'Enter more details',
    })
  })
})
