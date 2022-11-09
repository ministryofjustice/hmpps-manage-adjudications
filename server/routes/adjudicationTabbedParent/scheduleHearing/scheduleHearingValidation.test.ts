import { OicHearingType } from '../../../data/ReportedAdjudicationResult'
import validateForm from './scheduleHearingValidation'

describe('validateForm', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2022-11-01T11:00:00'))
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(
        validateForm({
          hearingDate: { date: '01/01/2030', time: { hour: '12', minute: '23' } },
          locationId: 2343,
          hearingType: OicHearingType.GOV_ADULT as string,
        })
      ).toBeNull()
    })
  })
  describe('hearingDate', () => {
    it('shows error if a date is not selected', () => {
      expect(
        validateForm({
          hearingDate: { time: { hour: '12', minute: '23' } },
          locationId: 2343,
          hearingType: OicHearingType.GOV_ADULT as string,
        })
      ).toEqual({
        href: '#hearingDate[date]',
        text: 'Enter date of hearing',
      })
    })
  })
  describe('locationId', () => {
    it('shows error if location is not selected', () => {
      expect(
        validateForm({
          hearingDate: { time: { hour: '12', minute: '23' } },
          hearingType: OicHearingType.GOV_ADULT as string,
        })
      ).toEqual({
        href: '#locationId',
        text: 'Select location of hearing',
      })
    })
  })
  describe('Time', () => {
    it('shows error if an hour is not submitted', () => {
      expect(
        validateForm({
          hearingDate: { date: '01/01/2030', time: { minute: '23' } },
          locationId: 2343,
          hearingType: OicHearingType.GOV_ADULT as string,
        })
      ).toEqual({
        href: '#hearingDate[time][hour]',
        text: 'Select time of hearing',
      })
    })
    it('shows error if a minute is not submitted', () => {
      expect(
        validateForm({
          hearingDate: { date: '01/01/2030', time: { hour: '12' } },
          locationId: 2343,
          hearingType: OicHearingType.GOV_ADULT as string,
        })
      ).toEqual({
        href: '#hearingDate[time][hour]',
        text: 'Select time of hearing',
      })
    })
    it('shows error if no time is not submitted', () => {
      expect(
        validateForm({
          hearingDate: { date: '01/01/2030' },
          locationId: 2343,
          hearingType: OicHearingType.GOV_ADULT as string,
        })
      ).toEqual({
        href: '#hearingDate[time][hour]',
        text: 'Select time of hearing',
      })
    })
    it('shows error if a time in the past is entered', () => {
      expect(
        validateForm({
          hearingDate: { date: '01/11/2022', time: { hour: '09', minute: '00' } },
          locationId: 2343,
          hearingType: OicHearingType.GOV_ADULT as string,
        })
      ).toEqual({
        href: '#hearingDate[time][hour]',
        text: 'The hearing time must be in the future',
      })
    })
    it('shows error if no hearing type is entered', () => {
      expect(
        validateForm({
          hearingDate: { date: '01/11/2022', time: { hour: '09', minute: '00' } },
          locationId: 2343,
        })
      ).toEqual({
        href: '#hearingType',
        text: 'Select type of hearing',
      })
    })
  })
})
