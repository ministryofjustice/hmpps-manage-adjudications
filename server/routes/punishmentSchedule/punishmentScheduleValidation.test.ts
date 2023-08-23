import { PunishmentType } from '../../data/PunishmentResult'
import validateForm from './punishmentScheduleValidation'

describe('validateForm', () => {
  it('Valid submit has no errors when suspended', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        suspended: 'yes',
        suspendedUntil: '3/4/2023',
        isYOI: false,
      })
    ).toBeNull()
  })
  it('Valid submit when not suspended', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        suspended: 'no',
        startDate: '3/4/2023',
        endDate: '3/4/2023',
        isYOI: false,
      })
    ).toBeNull()
  })

  it('Valid submit when prospective days', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.PROSPECTIVE_DAYS,
        days: 10,
        suspended: 'no',
        isYOI: false,
      })
    ).toBeNull()
  })

  it('Valid submit when additional days', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.ADDITIONAL_DAYS,
        days: 10,
        suspended: 'no',
        isYOI: false,
      })
    ).toBeNull()
  })
  it('Valid submit when prospective days - suspended', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.PROSPECTIVE_DAYS,
        days: 10,
        suspended: 'yes',
        suspendedUntil: '10/5/2023',
        isYOI: false,
      })
    ).toBeNull()
  })

  it('Valid submit when additional days - suspended', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.ADDITIONAL_DAYS,
        days: 10,
        suspended: 'yes',
        suspendedUntil: '10/5/2023',
        isYOI: false,
      })
    ).toBeNull()
  })

  it('shows error when no days select', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: null,
        suspended: null,
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
        suspended: null,
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
        suspended: 'no',
        startDate: '01/6/2023',
        endDate: '10/6/2023',
        isYOI: true,
      })
    ).toEqual({
      href: '#days',
      text: 'Cellular confinement cannot be more than 10 days for an offence under YOI rules',
    })
  })
  it('shows error when suspended decision not select', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        suspended: null,
        isYOI: false,
      })
    ).toEqual({
      href: '#suspended',
      text: 'Select yes if this punishment is to be suspended',
    })
  })
  it('shows error when suspended date not set', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        suspended: 'yes',
        isYOI: false,
      })
    ).toEqual({
      href: '#suspendedUntil',
      text: 'Enter the date the punishment is suspended until',
    })
  })
  it('shows error when start date not set', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
        days: 10,
        suspended: 'no',
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
        suspended: 'no',
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
        suspended: 'no',
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
