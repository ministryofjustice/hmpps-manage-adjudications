import { FormError } from '../../../@types/template'

type ConsecutivePunishmentChargeNumberForm = {
  consecutiveChargeNumber: string
}

const errors: { [key: string]: FormError } = {
  NOT_NUMERICAL: {
    href: '#consecutiveChargeNumber',
    text: 'Charge number must only include numbers',
  },
  MISSING_CHARGE: {
    href: '#consecutiveChargeNumber',
    text: 'Enter a charge number',
  },
  NOT_CORRECT_LENGTH: {
    href: '#consecutiveChargeNumber',
    text: 'Charge number must be 7 numbers long',
  },
}

export default function validateForm({
  consecutiveChargeNumber,
}: ConsecutivePunishmentChargeNumberForm): FormError | null {
  if (consecutiveChargeNumber === undefined || consecutiveChargeNumber === null || !consecutiveChargeNumber)
    return errors.MISSING_CHARGE
  if (Number.isNaN(Number(consecutiveChargeNumber))) return errors.NOT_NUMERICAL
  if (String(consecutiveChargeNumber).length !== 7) return errors.NOT_CORRECT_LENGTH
  return null
}
