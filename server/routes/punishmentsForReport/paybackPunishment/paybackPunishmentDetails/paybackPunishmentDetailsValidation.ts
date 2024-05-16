import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  paybackNotes: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DETAILS: {
    href: '#paybackNotes',
    text: 'Enter the details of the punishment',
  },
}

export default function validateForm({ paybackNotes }: PunishmentForm): FormError | null {
  if (!paybackNotes) return errors.MISSING_DETAILS

  return null
}
