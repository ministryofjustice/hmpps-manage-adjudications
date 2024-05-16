import validateForm from './paybackPunishmentCompletionDateValidation'

describe('', () => {
  it('Valid submit returns null', () => {
    expect(validateForm({ lastDay: '2026-01-01' })).toBeNull()
  })
  it('Missing date returns error', () => {
    expect(validateForm({ lastDay: null })).toEqual({
      href: '#lastDay',
      text: 'Enter when the punishment must be completed by',
    })
  })
})
