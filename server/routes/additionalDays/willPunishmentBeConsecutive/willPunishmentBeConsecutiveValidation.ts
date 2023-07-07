import { FormError } from '../../../@types/template'

type WillPunishmentBeConsecutiveForm = {
  consecutive?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_RADIO: {
    href: '#consecutive',
    text: 'Select yes if this punishment is consecutive to another punishment',
  },
}

export default function validateForm({ consecutive }: WillPunishmentBeConsecutiveForm): FormError | null {
  if (!consecutive) return errors.MISSING_RADIO
  return null
}
