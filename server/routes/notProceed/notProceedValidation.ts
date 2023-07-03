import { FormError } from '../../@types/template'
import { NotProceedReason } from '../../data/HearingAndOutcomeResult'

type NotProceedForm = {
  notProceedReason: NotProceedReason
  notProceedDetails: string
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON: {
    href: '#notProceedReason',
    text: 'Select the reason for not proceeding',
  },
  MISSING_DETAILS: {
    href: '#notProceedDetails',
    text: 'Enter more details',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#notProceedDetails',
    text: 'Your statement must be 4,000 characters or fewer',
  },
}

export default function validateForm({ notProceedReason, notProceedDetails }: NotProceedForm): FormError | null {
  if (!notProceedReason) return errors.MISSING_REASON

  if (!notProceedDetails) {
    return errors.MISSING_DETAILS
  }
  if (notProceedDetails.length > 4000) return errors.WORD_COUNT_EXCEEDED
  return null
}
