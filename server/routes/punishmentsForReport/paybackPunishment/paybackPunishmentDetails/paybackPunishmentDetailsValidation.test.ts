import { wordLimitExceedingString } from '../../../../utils/utils'
import validateForm from './paybackPunishmentDetailsValidation'

describe('', () => {
  it('Valid submit returns null', () => {
    expect(validateForm({ paybackNotes: 'This is an explanation' })).toBeNull()
  })
  it('Missing notes return error', () => {
    expect(validateForm({ paybackNotes: null })).toEqual({
      href: '#paybackNotes',
      text: 'Enter the details of the punishment',
    })
  })
  it('Word count > 4000 returns error', () => {
    expect(validateForm({ paybackNotes: wordLimitExceedingString })).toEqual({
      href: '#paybackNotes',
      text: 'Your details must be 4,000 characters or less',
    })
  })
})
