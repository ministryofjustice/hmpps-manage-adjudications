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
      href: '#reason',
      text: 'Missing reason',
    })
  })
  it('shows error when no prosecution option selected', () => {
    expect(
      validateForm({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: '',
      })
    ).toEqual({
      href: '#details',
      text: 'Missing details',
    })
  })
})
