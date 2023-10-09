import { FormError } from '../../../@types/template'
import { isBlank } from '../../../utils/utils'

type PunishmentCommentForm = {
  punishmentComment: string
}

const errors: { [key: string]: FormError } = {
  PUNISHMENT_COMMENT_STRING_IS_BLANK: {
    href: '#punishmentComment',
    text: 'Enter a comment',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#punishmentComment',
    text: 'Your comment must be 4,000 characters or fewer',
  },
}

export default function validateForm({ punishmentComment }: PunishmentCommentForm): FormError | null {
  if (isBlank(punishmentComment)) return errors.PUNISHMENT_COMMENT_STRING_IS_BLANK
  if (punishmentComment.length > 4000) return errors.WORD_COUNT_EXCEEDED

  return null
}
