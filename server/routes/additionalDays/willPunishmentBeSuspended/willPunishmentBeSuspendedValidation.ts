import { FormError } from '../../../@types/template'

type WillPunishmentBeSuspendedForm = {
  suspended?: string
  suspendedUntil?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_SUSPENDED_DECISION: {
    href: '#suspended',
    text: 'Select yes if this punishment is to be suspended',
  },
  MISSING_SUSPENDED_UNTIL: {
    href: '#suspendedUntil',
    text: 'Enter the date the punishment is suspended until',
  },
}

export default function validateForm({ suspended, suspendedUntil }: WillPunishmentBeSuspendedForm): FormError | null {
  if (!suspended) return errors.MISSING_SUSPENDED_DECISION
  if (suspended === 'yes' && !suspendedUntil) return errors.MISSING_SUSPENDED_UNTIL

  return null
}
