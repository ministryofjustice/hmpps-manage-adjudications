import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  lastDay: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DATE: {
    href: '#lastDay',
    text: 'Enter when the punishment must be completed by',
  },
}

export default function validateForm({ lastDay }: PunishmentForm): FormError | null {
  if (!lastDay) return errors.MISSING_DATE

  return null
}
