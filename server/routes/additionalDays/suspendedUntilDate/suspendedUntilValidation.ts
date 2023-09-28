import { FormError } from '../../../@types/template'

type SuspendedUntilDateForm = {
  suspendedUntil?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_SUSPENDED_UNTIL: {
    href: '#suspendedUntil',
    text: 'Enter the date the punishment is suspended until',
  },
}

export default function validateForm({ suspendedUntil }: SuspendedUntilDateForm): FormError | null {
  if (!suspendedUntil) return errors.MISSING_SUSPENDED_UNTIL
  return null
}
