import { PunishmentType } from '../../../../data/PunishmentResult'
import validateForm from './numberOfDaysValidation'

describe('validateForm', () => {
  it('Valid submit when prospective days', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.PROSPECTIVE_DAYS,
        duration: 10,
        isYOI: false,
      })
    ).toBeNull()
  })

  it('Valid submit when additional days', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.ADDITIONAL_DAYS,
        duration: 10,
        isYOI: false,
      })
    ).toBeNull()
  })
  it('shows error when no days selected', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        duration: null,
        isYOI: false,
      })
    ).toEqual({
      href: '#duration',
      text: 'Enter how many days the punishment will last',
    })
  })
  it('shows error when too few days are entered', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        // @ts-expect-error: ignore
        duration: '0',
        isYOI: false,
      })
    ).toEqual({
      href: '#duration',
      text: 'Enter one or more days',
    })
  })
  it('shows error when validatePunishmentDays errors', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        duration: 11,
        isYOI: true,
      })
    ).toEqual({
      href: '#duration',
      text: 'Cellular confinement cannot be more than 10 days for an offence under YOI rules',
    })
  })
})
