import { FormError } from '../../../../@types/template'

type IsPunishmentSuspendedForm = {
  suspended: string
}

const errors: { [key: string]: FormError } = {
  MISSING_RADIO: {
    href: '#suspended',
    text: 'Select yes if this punishment is to be suspended',
  },
}

export default function validateForm({ suspended }: IsPunishmentSuspendedForm): FormError | null {
  if (!suspended) return errors.MISSING_RADIO
  return null
}
