import { FormError } from '../../../@types/template'

type DamagesOwedForm = {
  damagesOwed: string
  amount: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DAMAGES_OWED_CHOICE: {
    href: '#damagesOwed',
    text: 'Select yes if any money is being recovered for damages',
  },
  MISSING_AMOUNT: {
    href: '#amount',
    text: 'Enter amount being recovered',
  },
  NAN: {
    href: '#amount',
    text: 'Numerical values only',
  },
}

export default function validateForm({ damagesOwed, amount }: DamagesOwedForm): FormError | null {
  if (!damagesOwed) {
    return errors.MISSING_DAMAGES_OWED_CHOICE
  }

  if (damagesOwed === 'yes') {
    if (!amount) {
      return errors.MISSING_AMOUNT
    }
    if (Number.isNaN(Number(amount))) {
      return errors.NAN
    }
  }

  return null
}
