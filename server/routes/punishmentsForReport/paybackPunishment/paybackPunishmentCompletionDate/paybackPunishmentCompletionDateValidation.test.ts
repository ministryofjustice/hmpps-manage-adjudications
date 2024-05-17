import validateForm from './paybackPunishmentCompletionDateValidation'

describe('', () => {
  it('Valid submit returns null', () => {
    expect(validateForm({ endDate: '2026-01-01' })).toBeNull()
  })
  it('Missing date returns error', () => {
    expect(validateForm({ endDate: null })).toEqual({
      href: '#endDate',
      text: 'Enter when the punishment must be completed by',
    })
  })
})
