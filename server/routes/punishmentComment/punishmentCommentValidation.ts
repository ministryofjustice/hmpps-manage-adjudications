import { FormError } from '../../@types/template'
import { isBlank } from '../../utils/utils'

type PunishmentCommentForm = {
  punishmentComment: string
}

const errors: { [key: string]: FormError } = {
  PUNISHMENT_COMMENT_STRING_IS_BLANK: {
    href: '#punishmentComment',
    text: 'Punishment comment string cannot be blank',
  },
}

export default function validateForm({ punishmentComment }: PunishmentCommentForm): FormError | null {
  if (isBlank(punishmentComment)) return errors.MISSING_PUNISHMENT_TYPE
  return null
}
