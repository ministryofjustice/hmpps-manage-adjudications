import { FormError } from '../../../../@types/template'

type PunishmentStartDateChoiceForm = {
  immediate: string
}

const errors: { [key: string]: FormError } = {
  MISSING_RADIO: {
    href: '#immediate',
    text: 'Select when this punishment starts',
  },
}

export default function validateForm({ immediate }: PunishmentStartDateChoiceForm): FormError | null {
  if (!immediate) return errors.MISSING_RADIO
  return null
}
