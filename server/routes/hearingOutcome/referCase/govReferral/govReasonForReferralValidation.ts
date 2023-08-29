import { FormError } from '../../../../@types/template'

type referralReasonForm = {
  referralReason: string
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON: {
    href: '#referralReason',
    text: 'Enter the reason for the referral',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#referralReason',
    text: 'Your statement must be 4,000 characters or fewer',
  },
}

export default function validateForm({ referralReason }: referralReasonForm): FormError | null {
  if (!referralReason) {
    return errors.MISSING_REASON
  }
  if (referralReason.length > 4000) return errors.WORD_COUNT_EXCEEDED

  return null
}
