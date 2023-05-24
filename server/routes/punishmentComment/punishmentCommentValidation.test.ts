import validateForm from './punishmentCommentValidation'

describe('validateForm', () => {
  it('Valid submit has no errors when comment is not blank', () => {
    expect(
      validateForm({
        punishmentComment: 'some text',
      })
    ).toBeNull()
  })
  it('shows error when no punishment comment is not blank', () => {
    expect(
      validateForm({
        punishmentComment: '  ',
      })
    ).toEqual({
      href: '#punishmentComment',
      text: 'Punishment comment cannot be blank',
    })
  })
})
