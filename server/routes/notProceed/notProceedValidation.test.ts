import { NotProceedReason } from '../../data/HearingAndOutcomeResult'
import { wordLimitExceedingString } from '../../utils/utils'
import validateForm from './notProceedValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: 'details',
      }),
    ).toBeNull()
  })
  it('shows error when no prosecution option selected', () => {
    expect(
      validateForm({
        notProceedReason: null,
        notProceedDetails: 'details',
      }),
    ).toEqual({
      href: '#notProceedReason',
      text: 'Select the reason for not proceeding',
    })
  })
  it('shows error when no prosecution option selected', () => {
    expect(
      validateForm({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: '',
      }),
    ).toEqual({
      href: '#notProceedDetails',
      text: 'Enter more details',
    })
  })
  it('character count - returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: wordLimitExceedingString,
      }),
    ).toStrictEqual({
      href: '#notProceedDetails',
      text: 'Your statement must be 4,000 characters or fewer',
    })
  })
})
