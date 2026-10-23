import validateForm, { validateCompletionDate } from './activityDetailsValidation'

const prisonerName = 'Geoff Fish'
const details = 'Dish washing'
const monitorName = 'Vera Wang'
const endDate = '2024-12-30'
const totalSessions = 2

describe('', () => {
  it('Valid submit returns null', () => {
    expect(validateForm({ prisonerName, details, monitorName, endDate, totalSessions })).toBeNull()
  })
  it('Errors if the total sessions entry is not a number', () => {
    // @ts-expect-error: total sessions not a number
    expect(validateForm({ prisonerName, details, monitorName, endDate, totalSessions: 'beep' })).toEqual({
      href: '#totalSessions',
      text: 'Number of sessions must be a number',
    })
  })
  it('Errors if the details are missing', () => {
    // @ts-expect-error: Details missing
    expect(validateForm({ prisonerName, monitorName, endDate, totalSessions })).toEqual({
      href: '#details',
      text: `Enter the activity ${prisonerName} will be doing`,
    })
  })
  it('Errors if the monitor name are missing', () => {
    // @ts-expect-error: Monitor name missing
    expect(validateForm({ prisonerName, details, endDate, totalSessions })).toEqual({
      href: '#monitorName',
      text: `Enter who is monitoring ${prisonerName} on the activity`,
    })
  })
  it('Errors if the end date is missing', () => {
    // @ts-expect-error: End date missing
    expect(validateForm({ prisonerName, details, monitorName, totalSessions })).toEqual({
      href: '#endDate',
      text: 'Enter when the activity should be completed by',
    })
  })
  it('uses `the prisoner` instead of the prisoner name if it is missing', () => {
    // @ts-expect-error: Prisoner name missing - details
    expect(validateForm({ monitorName, endDate, totalSessions })).toEqual({
      href: '#details',
      text: `Enter the activity the prisoner will be doing`,
    })
  })
  it('uses `the prisoner` instead of the prisoner name if it is missing', () => {
    // @ts-expect-error: Prisoner name missing - monitor name
    expect(validateForm({ details, endDate, totalSessions })).toEqual({
      href: '#monitorName',
      text: `Enter who is monitoring the prisoner on the activity`,
    })
  })
})

describe('validateCompletionDate', () => {
  it('accepts a date on or before the date the punishment is suspended until', () => {
    expect(
      validateCompletionDate({ endDate: '16/09/2026', latestDate: '2026-09-16', coversSeveralPunishments: false }),
    ).toBeNull()
  })

  it('rejects a date after the date the punishment is suspended until', () => {
    expect(
      validateCompletionDate({ endDate: '17/9/2026', latestDate: '2026-09-16', coversSeveralPunishments: false }),
    ).toEqual({
      href: '#endDate',
      text: 'Completion date must be on or before 16 September 2026, the date the punishment is suspended until',
    })
  })

  it('names the earliest date when the activity covers several punishments', () => {
    expect(
      validateCompletionDate({ endDate: '1/10/2026', latestDate: '2026-09-16', coversSeveralPunishments: true }).text,
    ).toEqual(
      'Completion date must be on or before 16 September 2026, the earliest date these punishments are suspended until',
    )
  })

  it('rejects a date that does not exist', () => {
    expect(
      validateCompletionDate({ endDate: '31/9/2026', latestDate: '2026-09-16', coversSeveralPunishments: false }).text,
    ).toContain('Completion date must be a real date')
  })
})
