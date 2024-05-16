import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  paybackNotes: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DETAILS: {
    href: '#paybackNotes',
    text: 'Enter the details of the punishment',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#paybackNotes',
    text: 'Your details must be 4,000 characters or less',
  },
}

export default function validateForm({ paybackNotes }: PunishmentForm): FormError | null {
  if (!paybackNotes) return errors.MISSING_DETAILS
  if (paybackNotes.length > 4000) return errors.WORD_COUNT_EXCEEDED

  return null
}
