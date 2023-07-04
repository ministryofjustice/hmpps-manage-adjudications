import { FormError } from '../../@types/template'

type NumberOfAddedDaysForm = {
  days: number
}

const errors: { [key: string]: FormError } = {
  MISSING_DAYS: {
    href: '#days',
    text: 'Enter how many days the punishment will last',
  },
  DAYS_TOO_FEW: {
    href: '#days',
    text: 'Enter one or more days',
  },
}

export default function validateForm({ days }: NumberOfAddedDaysForm): FormError | null {
  if (Number.isInteger(days) && days <= 0) return errors.DAYS_TOO_FEW
  if (days === undefined || days === null || !days) return errors.MISSING_DAYS
  return null
}
