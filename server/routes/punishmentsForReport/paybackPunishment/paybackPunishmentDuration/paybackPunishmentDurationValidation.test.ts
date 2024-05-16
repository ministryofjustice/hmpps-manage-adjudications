import validateForm from './paybackPunishmentDurationValidation'

describe('', () => {
  it('Valid submit returns null', () => {
    expect(validateForm({ duration: 8 })).toBeNull()
  })
  it('', () => {})
})
