import validateForm from './punishmentScheduleValidation'

describe('validateForm', () => {
  it('Valid submit has no errors when suspended', () => {
    expect(
      validateForm({
        days: 10,
        suspended: 'yes',
        suspendedUntil: '3/4/2023',
      })
    ).toBeNull()
  })
  it('Valid submit when not suspended', () => {
    expect(
      validateForm({
        days: 10,
        suspended: 'no',
        startDate: '3/4/2023',
        endDate: '3/4/2023',
      })
    ).toBeNull()
  })

  it('shows error when no  days select', () => {
    expect(
      validateForm({
        days: null,
        suspended: null,
      })
    ).toEqual({
      href: '#days',
      text: 'Enter how many days the punishment will last',
    })
  })
  it('shows error when suspended decision not select', () => {
    expect(
      validateForm({
        days: 10,
        suspended: null,
      })
    ).toEqual({
      href: '#suspended',
      text: 'Select yes, if this punishment is to be suspended',
    })
  })
  it('shows error when suspended date not set', () => {
    expect(
      validateForm({
        days: 10,
        suspended: 'yes',
      })
    ).toEqual({
      href: '#suspendedUntil',
      text: 'Enter the date the punishment is suspended until',
    })
  })
  it('shows error when start date not set', () => {
    expect(
      validateForm({
        days: 10,
        suspended: 'no',
      })
    ).toEqual({
      href: '#startDate',
      text: 'Enter the date this punishment will start',
    })
  })
  it('shows error when end date not set', () => {
    expect(
      validateForm({
        days: 10,
        suspended: 'no',
        startDate: '3/4/2023',
      })
    ).toEqual({
      href: '#endDate',
      text: 'Enter the last day of this punishment',
    })
  })
})
