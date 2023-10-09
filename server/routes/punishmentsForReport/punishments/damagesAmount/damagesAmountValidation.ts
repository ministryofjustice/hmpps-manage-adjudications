import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  damagesOwedAmount?: number
}

const errors: { [key: string]: FormError } = {
  MISSING_AMOUNT: {
    href: '#damagesOwedAmount',
    text: 'Enter the amount to be recovered for damages',
  },
  NOT_A_NUMBER: {
    href: '#damagesOwedAmount',
    text: 'Amount to be recovered for damages must be a number',
  },
}

export default function validateForm({ damagesOwedAmount }: PunishmentForm): FormError | null {
  if (!damagesOwedAmount) {
    return errors.MISSING_AMOUNT
  }
  if (Number.isNaN(Number(damagesOwedAmount))) {
    return errors.NOT_A_NUMBER
  }
  return null
}
