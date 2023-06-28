import validateForm from './addDamagesValidation'
import { wordLimitExceedingString } from '../../utils/utils'

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
  describe('Character count exceeded', () => {
    it('returns the expected response for a valid submit', () => {
      expect(validateForm({ damageDescription: 'hello 123', damageType: 'Redecoration' })).toBeNull()
    })
    it('returns the expected response for an invalid submit', () => {
      expect(validateForm({ damageDescription: wordLimitExceedingString, damageType: 'Redecoration' })).toStrictEqual({
        href: '#damageDescription',
        text: 'Your statement must be 4,000 characters or fewer',
      })
    })
  })
})
