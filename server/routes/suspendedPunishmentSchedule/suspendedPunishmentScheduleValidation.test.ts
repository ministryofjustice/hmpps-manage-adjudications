import { PunishmentType } from '../../data/PunishmentResult'
import validateForm from './suspendedPunishmentScheduleValidation'

describe('validateForm', () => {
  it('Valid submit has no errors - punishment type not additional days', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        startDate: '01/6/2023',
        endDate: '10/6/2023',
        isYOI: false,
      })
    ).toBeNull()
  })
  it('Valid submit has no errors - punishment type is additional days', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.ADDITIONAL_DAYS,
        days: 10,
        isYOI: false,
      })
    ).toBeNull()
  })

  it('Valid submit when additional days', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.ADDITIONAL_DAYS,
        days: 10,
        isYOI: false,
      })
    ).toBeNull()
  })
  it('shows error when no days select', () => {
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
  it('shows error when validatePunishmentDays errors', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 11,
        startDate: '01/6/2023',
        endDate: '10/6/2023',
        isYOI: true,
      })
    ).toEqual({
      href: '#days',
      text: 'Cellular confinement cannot be more than 10 days for an offence under YOI rules',
    })
  })
  it('shows error when start date not set', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        isYOI: false,
      })
    ).toEqual({
      href: '#startDate',
      text: 'Enter the date this punishment will start',
    })
  })
  it('shows error when end date not set', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        startDate: '3/4/2023',
        isYOI: false,
      })
    ).toEqual({
      href: '#endDate',
      text: 'Enter the last day of this punishment',
    })
  })
  it('shows error when end date is before start date', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        startDate: '13/4/2023',
        endDate: '3/4/2023',
        isYOI: false,
      })
    ).toEqual({
      href: '#endDate',
      text: 'Enter an end date that is after the start date',
    })
  })
})
