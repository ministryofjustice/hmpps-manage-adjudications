import { FormError } from '../../@types/template'

type NumberOfAddedDaysForm = {
  numberOfDays: number
}

const errors: { [key: string]: FormError } = {
  NOT_NUMERICAL: {
    href: '#numberOfDays',
    text: 'Enter a number of days',
  },
  DAYS_TOO_FEW: {
    href: '#numberOfDays',
    text: 'Enter one or more days',
  },
  MISSING_DAYS: {
    href: '#numberOfDays',
    text: 'Enter how many days the punishment will last',
  },
}

export default function validateForm({ numberOfDays }: NumberOfAddedDaysForm): FormError | null {
  if (Number.isNaN(numberOfDays) || typeof numberOfDays === 'string') return errors.NOT_NUMERICAL
  if (Number.isInteger(numberOfDays) && numberOfDays <= 0) return errors.DAYS_TOO_FEW
  if (numberOfDays === undefined || numberOfDays === null || !numberOfDays) return errors.MISSING_DAYS
  return null
}
