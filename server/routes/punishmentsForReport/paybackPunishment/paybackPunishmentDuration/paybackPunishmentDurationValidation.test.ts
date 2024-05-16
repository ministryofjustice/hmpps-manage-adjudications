import validateForm from './paybackPunishmentDurationValidation'

describe('', () => {
  it('Valid submit returns null', () => {
    expect(validateForm({ duration: 8 })).toBeNull()
  })
  it('Missing duration triggers validation', () => {
    expect(validateForm({ duration: null })).toEqual({
      href: '#duration',
      text: 'Enter how many hours this punishment will last',
    })
  })
  it('String duration triggers validation', () => {
    // @ts-expect-error: ts(2322) Required for test
    expect(validateForm({ duration: 'hello' })).toEqual({
      href: '#duration',
      text: 'The hours this punishment will last must be a number',
    })
  })
  it('Duration > 12 triggers validation', () => {
    expect(validateForm({ duration: 100 })).toEqual({
      href: '#duration',
      text: 'Hours for a payback punishment must be 12 or fewer',
    })
  })
})
