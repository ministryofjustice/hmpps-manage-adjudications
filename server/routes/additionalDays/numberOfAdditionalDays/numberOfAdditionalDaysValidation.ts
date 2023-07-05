import { FormError } from '../../../@types/template'

type NumberOfAddedDaysForm = {
  days: number
}

const errors: { [key: string]: FormError } = {
  NOT_NUMERICAL: {
    href: '#days',
    text: 'Enter a number of days',
  },
  DAYS_TOO_FEW: {
    href: '#days',
    text: 'Enter one or more days',
  },
  MISSING_DAYS: {
    href: '#days',
    text: 'Enter how many days the punishment will last',
  },
}

export default function validateForm({ days }: NumberOfAddedDaysForm): FormError | null {
  if (Number.isNaN(days) || typeof days === 'string') return errors.NOT_NUMERICAL
  if (Number.isInteger(days) && days <= 0) return errors.DAYS_TOO_FEW
  if (days === undefined || days === null || !days) return errors.MISSING_DAYS
  return null
}
