import validateForm from './addDamagesValidation'

describe('ValidateForm', () => {
  it('returns null if there are no errors', () => {
    const result = validateForm({ damageDescription: 'Wallpaper was ripped', damageType: 'Redecoration' })
    expect(result).toBe(null)
  })
  it('returns error if the damage type is missing', () => {
    const result = validateForm({ damageDescription: 'Wallpaper was ripped', damageType: undefined })
    expect(result).toStrictEqual({
      href: '#damageType',
      text: 'Select what needs to be done',
    })
  })
  it('returns error if the damage description is empty', () => {
    const result = validateForm({ damageDescription: '', damageType: 'Redecoration' })
    expect(result).toStrictEqual({
      href: '#damageDescription',
      text: 'Enter details about these damages',
    })
  })
})
