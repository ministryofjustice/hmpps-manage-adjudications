import validateForm from './incidentDetailsValidation'

describe('validateForm', () => {
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '12', minute: '23' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toBeNull()
    })
  })
  describe('incidentDate', () => {
    it('shows error if a date is not selected', () => {
      expect(
        validateForm({
          incidentDate: { time: { hour: '12', minute: '23' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[date]',
        text: 'Enter the date of the incident',
      })
    })
    it('shows error if discovery radio not set', () => {
      expect(
        validateForm({
          incidentDate: { time: { hour: '12', minute: '23' } },
          discoveryDate: { date: '' },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: '',
        })
      ).toEqual({
        href: '#discoveryRadioSelected',
        text: 'Select yes if the incident was discovered at the same time',
      })
    })
    it('shows error if discovery radio set to No', () => {
      expect(
        validateForm({
          incidentDate: { time: { hour: '12', minute: '23' } },
          discoveryDate: { date: '', time: { hour: '', minute: '' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'No',
        })
      ).toEqual({
        href: '#discoveryDate[date]',
        text: 'Enter the date of the incident discovery',
      })
    })
    it('shows error if discovery radio set to No, date set but no hour', () => {
      expect(
        validateForm({
          incidentDate: { time: { hour: '', minute: '23' } },
          discoveryDate: { date: '20/12/2022', time: { hour: '', minute: '23' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'No',
        })
      ).toEqual({
        href: '#discoveryDate[time]',
        text: 'Enter the time of the discovery',
      })
    })
  })
  describe('incidentTime', () => {
    beforeAll(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date(1636017690000))
    })
    afterAll(() => {
      jest.useRealTimers()
    })
    it('shows error if an hour is not submitted', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { minute: '23' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][hour]',
        text: 'Enter the time of the incident',
      })
    })
    it('shows error if an invalid hour is submitted', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '65', minute: '23' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][hour]',
        text: 'Enter an hour between 00 and 23',
      })
    })
    it('shows error if a minute is not submitted', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '12' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][minute]',
        text: 'Enter the time of the incident',
      })
    })
    it('shows error if an invalid minute is submitted', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '12', minute: '65' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][minute]',
        text: 'Enter a minute between 00 and 59',
      })
    })
    it('shows error if neither an hour or a minute is submitted', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: {} },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time]',
        text: 'Enter the time of the incident',
      })
    })
    it('shows error if only one digit for hours', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '8', minute: '30' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][hour]',
        text: 'Enter the hour using 2 numbers - for example, 08 or 18',
      })
    })
    it('shows error if more than two digits entered for hours', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '008', minute: '30' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][hour]',
        text: 'Enter the hour using 2 numbers - for example, 08 or 18',
      })
    })
    it('shows error if only one digit for minutes', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '08', minute: '1' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][minute]',
        text: 'Enter the minute using 2 numbers - for example, 08 or 18',
      })
    })
    it('shows error if more than two digits entered for minutes', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '08', minute: '001' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][minute]',
        text: 'Enter the minute using 2 numbers - for example, 08 or 18',
      })
    })
    it('shows error if letters are entered for the hour field', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: 'lll', minute: '50' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][hour]',
        text: 'Enter an hour between 00 and 23',
      })
    })
    it('shows error if letters are entered for the minute field', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '09', minute: 'fffff' } },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time][minute]',
        text: 'Enter a minute between 00 and 59',
      })
    })
    it('shows error if the time entered is in the future (on the current day)', () => {
      expect(new Date().valueOf()).toBe(1636017690000)
      // 2021-11-04T09:21:30.000Z
      expect(
        validateForm({
          incidentDate: {
            date: '04/11/2021',
            time: { hour: `09`, minute: `22` },
          },
          locationId: 2343,
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#incidentDate[time]',
        text: 'The incident time must be in the past',
      })
    })
  })
  describe('locationId', () => {
    it('shows error if location is not selected', () => {
      expect(
        validateForm({
          incidentDate: { date: '31/10/2021', time: { hour: '12', minute: '23' } },
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
          discoveryRadioSelected: 'Yes',
        })
      ).toEqual({
        href: '#locationId',
        text: 'Select the location of the incident',
      })
    })
  })
})
