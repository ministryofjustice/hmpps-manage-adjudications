import { FormError } from '../../../@types/template'

type startDateDateForm = {
  startDate?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DATE: {
    href: '#startDate',
    text: 'Enter the date the punishment will start',
  },
}

export default function validateForm({ startDate }: startDateDateForm): FormError | null {
  if (!startDate) return errors.MISSING_DATE
  return null
}
