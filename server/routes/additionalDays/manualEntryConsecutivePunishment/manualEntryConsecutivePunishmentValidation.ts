import { FormError } from '../../../@types/template'

type ConsecutivePunishmentChargeNumberForm = {
  chargeNumber: number
}

const errors: { [key: string]: FormError } = {
  NOT_NUMERICAL: {
    href: '#chargeNumber',
    text: 'Charge number must only include numbers',
  },
  MISSING_CHARGE: {
    href: '#chargeNumber',
    text: 'Enter a charge number',
  },
  NOT_CORRECT_LENGTH: {
    href: '#chargeNumber',
    text: 'Charge number must be 7 numbers long',
  },
}

export default function validateForm({ chargeNumber }: ConsecutivePunishmentChargeNumberForm): FormError | null {
  if (Number.isNaN(chargeNumber) || typeof chargeNumber === 'string') return errors.NOT_NUMERICAL
  if (chargeNumber === undefined || chargeNumber === null || !chargeNumber) return errors.MISSING_CHARGE
  if (chargeNumber.toString().length !== 7) return errors.NOT_CORRECT_LENGTH
  return null
}
