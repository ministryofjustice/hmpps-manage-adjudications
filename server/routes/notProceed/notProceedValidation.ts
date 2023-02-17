import { FormError } from '../../@types/template'
import { NotProceedReason } from '../../data/OutcomeResult'

type NotProceedForm = {
  notProceedReason: NotProceedReason
  notProceedDetails: string
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON: {
    href: '#reason',
    text: 'Select the reason for not proceeding',
  },
  MISSING_DETAILS: {
    href: '#details',
    text: 'Enter more details',
  },
}

export default function validateForm({ notProceedReason, notProceedDetails }: NotProceedForm): FormError | null {
  if (!notProceedReason) return errors.MISSING_REASON

  if (!notProceedDetails) {
    return errors.MISSING_DETAILS
  }

  return null
}
