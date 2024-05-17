import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  endDate: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DATE: {
    href: '#endDate',
    text: 'Enter when the punishment must be completed by',
  },
}

export default function validateForm({ endDate }: PunishmentForm): FormError | null {
  if (!endDate) return errors.MISSING_DATE

  return null
}
