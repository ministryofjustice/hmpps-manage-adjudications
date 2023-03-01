import { NotProceedReason } from '../../data/OutcomeResult'
import validateForm from './notProceedValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: 'details',
      })
    ).toBeNull()
  })
  it('shows error when no prosecution option selected', () => {
    expect(
      validateForm({
        notProceedReason: null,
        notProceedDetails: 'details',
      })
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
      })
    ).toEqual({
      href: '#notProceedDetails',
      text: 'Enter more details',
    })
  })
})
