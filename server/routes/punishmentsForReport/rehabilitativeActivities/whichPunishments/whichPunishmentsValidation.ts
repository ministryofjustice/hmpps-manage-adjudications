import { FormError } from '../../../../@types/template'

type WhichPunishmentsForm = {
  redisIds: string[]
}

const errors: { [key: string]: FormError } = {
  MISSING_PUNISHMENT: {
    href: '#redisIds',
    text: 'Select which punishments have a rehabilitative activity condition',
  },
}

export default function validateForm({ redisIds }: WhichPunishmentsForm): FormError | null {
  if (!redisIds.length) return errors.MISSING_PUNISHMENT
  return null
}
