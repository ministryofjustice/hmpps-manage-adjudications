import { FormError } from '../../../@types/template'

type referralReasonForm = {
  referralReason: string
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON: {
    href: '#referralReason',
    text: 'Enter the reason for the referral',
  },
}

export default function validateForm({ referralReason }: referralReasonForm): FormError | null {
  if (!referralReason) {
    return errors.MISSING_REASON
  }

  return null
}
