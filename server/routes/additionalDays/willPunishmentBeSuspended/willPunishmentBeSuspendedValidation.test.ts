import validateForm from './willPunishmentBeSuspendedValidation'

describe('validateForm', () => {
  it('Valid submit has no errors when suspended', () => {
    expect(
      validateForm({
        suspended: 'yes',
        suspendedUntil: '3/4/2023',
      })
    ).toBeNull()
  })
  it('Valid submit when not suspended', () => {
    expect(
      validateForm({
        suspended: 'no',
      })
    ).toBeNull()
  })
  it('shows error when suspended decision not selected', () => {
    expect(
      validateForm({
        suspended: null,
      })
    ).toEqual({
      href: '#suspended',
      text: 'Select yes if this punishment is to be suspended',
    })
  })
  it('shows error when suspended date not set', () => {
    expect(
      validateForm({
        suspended: 'yes',
      })
    ).toEqual({
      href: '#suspendedUntil',
      text: 'Enter the date the punishment is suspended until',
    })
  })
})
