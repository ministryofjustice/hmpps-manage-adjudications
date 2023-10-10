import validateForm from './numberOfAdditionalDaysValidation'
import { PunishmentType } from '../../../../data/PunishmentResult'

describe('validateForm', () => {
  it('Valid submit when days correct', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        isYOI: false,
      })
    ).toBeNull()
  })
  it('shows error when no days entered', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: null,
        isYOI: false,
      })
    ).toEqual({
      href: '#days',
      text: 'Enter how many days the punishment will last',
    })
  })
  it('shows error when validatePunishmentDays errors', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 11,
        isYOI: true,
      })
    ).toEqual({
      href: '#days',
      text: 'Cellular confinement cannot be more than 10 days for an offence under YOI rules',
    })
  })
  it('shows error when something other than a number is entered', () => {
    expect(
      validateForm({
        // @ts-expect-error: Ignore typecheck here
        days: 'hello',
      })
    ).toEqual({
      href: '#days',
      text: 'Enter a number of days',
    })
  })
  it('shows error when too few days are entered', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 0,
        isYOI: false,
      })
    ).toEqual({
      href: '#days',
      text: 'Enter one or more days',
    })
  })
})
