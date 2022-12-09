import validateForm from './addDateAndTimeValidation'

describe('validateForm', () => {
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(
        validateForm({
          date: '31/10/2021',
          time: { hour: '12', minute: '23' },
        })
      ).toBeNull()
    })
  })
  describe('issue date', () => {
    it('shows error if a date is not selected', () => {
      expect(
        validateForm({
          time: { hour: '12', minute: '23' },
        })
      ).toEqual({
        href: '#issuedDate[date]',
        text: 'Enter date of issue',
      })
    })
    describe('issue time', () => {
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
            date: '31/10/2021',
            time: { minute: '23' },
          })
        ).toEqual({
          href: '#issuedDate[time][hour]',
          text: 'Enter time of issue',
        })
      })
      it('shows error if an invalid hour is submitted', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '65', minute: '23' },
          })
        ).toEqual({
          href: '#issuedDate[time][hour]',
          text: 'Enter an hour between 00 and 23',
        })
      })
      it('shows error if a minute is not submitted', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '12' },
          })
        ).toEqual({
          href: '#issuedDate[time][minute]',
          text: 'Enter time of issue',
        })
      })
      it('shows error if an invalid minute is submitted', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '12', minute: '65' },
          })
        ).toEqual({
          href: '#issuedDate[time][minute]',
          text: 'Enter a minute between 00 and 59',
        })
      })
      it('shows error if neither an hour or a minute is submitted', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: {},
          })
        ).toEqual({
          href: '#issuedDate[time]',
          text: 'Enter time of issue',
        })
      })
      it('shows error if only one digit for hours', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '8', minute: '30' },
          })
        ).toEqual({
          href: '#issuedDate[time][hour]',
          text: 'Enter the hour using 2 numbers - for example, 08 or 18',
        })
      })
      it('shows error if more than two digits entered for hours', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '008', minute: '30' },
          })
        ).toEqual({
          href: '#issuedDate[time][hour]',
          text: 'Enter the hour using 2 numbers - for example, 08 or 18',
        })
      })
      it('shows error if only one digit for minutes', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '08', minute: '1' },
          })
        ).toEqual({
          href: '#issuedDate[time][minute]',
          text: 'Enter the minute using 2 numbers - for example, 08 or 18',
        })
      })
      it('shows error if more than two digits entered for minutes', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '08', minute: '001' },
          })
        ).toEqual({
          href: '#issuedDate[time][minute]',
          text: 'Enter the minute using 2 numbers - for example, 08 or 18',
        })
      })
      it('shows error if letters are entered for the hour field', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: 'lll', minute: '50' },
          })
        ).toEqual({
          href: '#issuedDate[time][hour]',
          text: 'Enter an hour between 00 and 23',
        })
      })
      it('shows error if letters are entered for the minute field', () => {
        expect(
          validateForm({
            date: '31/10/2021',
            time: { hour: '09', minute: 'fffff' },
          })
        ).toEqual({
          href: '#issuedDate[time][minute]',
          text: 'Enter a minute between 00 and 59',
        })
      })
      it('shows error if the time entered is in the future (on the current day)', () => {
        expect(new Date().valueOf()).toBe(1636017690000)
        // 2021-11-04T09:21:30.000Z
        expect(validateForm({ date: '04/11/2021', time: { hour: `09`, minute: `22` } })).toEqual({
          href: '#issuedDate[time]',
          text: 'The issue time must be in the past',
        })
      })
    })
  })
})
