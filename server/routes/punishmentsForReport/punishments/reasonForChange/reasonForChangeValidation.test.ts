import { PunishmentReasonForChange } from '../../../../data/PunishmentResult'
import validateForm from './reasonForChangeValidation'

describe('validateForm', () => {
  it('Valid submit has no errors', () => {
    expect(
      validateForm({
        reasonForChange: PunishmentReasonForChange.OTHER,
        detailsOfChange: 'this is the reason',
      })
    ).toBeNull()
  })
  it('error if reason missing', () => {
    expect(
      validateForm({
        detailsOfChange: 'this is the reason',
      })
    ).toEqual({
      href: '#reasonForChange',
      text: 'Select a reason',
    })
  })
  it('error if details missing', () => {
    expect(
      validateForm({
        reasonForChange: PunishmentReasonForChange.OTHER,
      })
    ).toEqual({
      href: '#detailsOfChange',
      text: 'Enter more details',
    })
  })
})
