import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  duration: number
}

const errors: { [key: string]: FormError } = {
  MISSING_DURATION: {
    href: '#duration',
    text: 'Enter how many hours this punishment will last',
  },
  DURATION_NOT_NUMBER: {
    href: '#duration',
    text: 'The hours this punishment will last must be a number',
  },
  DURATION_EXCEEDS_LIMIT: {
    href: '#duration',
    text: 'Hours for a payback punishment must be 12 or fewer',
  },
}

export default function validateForm({ duration }: PunishmentForm): FormError | null {
  if (!duration) return errors.MISSING_DURATION
  if (Number.isNaN(Number(duration))) return errors.DURATION_NOT_NUMBER
  if (duration > 12) return errors.DURATION_EXCEEDS_LIMIT

  return null
}
