import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  paybackSpecificsChoice: boolean
}

const errors: { [key: string]: FormError } = {
  MISSING_PAYBACK_CHOICE: {
    href: '#paybackPunishmentSpecifics',
    text: 'Select yes if you have the details of the payback punishment',
  },
}

export default function validateForm({ paybackSpecificsChoice }: PunishmentForm): FormError | null {
  if (!paybackSpecificsChoice) {
    return errors.MISSING_PAYBACK_CHOICE
  }

  return null
}
