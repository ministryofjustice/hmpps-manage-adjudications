import { FormError } from '../../../@types/template'

type WillPunishmentBeSuspendedForm = {
  suspended?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_SUSPENDED_DECISION: {
    href: '#suspended',
    text: 'Select yes if this punishment is to be suspended',
  },
}

export default function validateForm({ suspended }: WillPunishmentBeSuspendedForm): FormError | null {
  if (!suspended) return errors.MISSING_SUSPENDED_DECISION

  return null
}
