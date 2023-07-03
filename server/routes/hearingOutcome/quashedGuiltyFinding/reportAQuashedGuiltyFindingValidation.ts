import { FormError } from '../../../@types/template'

type quashedGuiltyFindingForm = {
  quashReason: string
  quashDetails: string
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON: {
    href: '#quashReason',
    text: 'Select why the guilty finding was quashed',
  },
  MISSING_DETAILS: {
    href: '#quashDetails',
    text: 'Enter more details',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#quashDetails',
    text: 'Your statement must be 4,000 characters or fewer',
  },
}

export default function validateForm({ quashReason, quashDetails }: quashedGuiltyFindingForm): FormError | null {
  if (!quashReason) {
    return errors.MISSING_REASON
  }
  if (!quashDetails) {
    return errors.MISSING_DETAILS
  }
  if (quashDetails.length > 4000) return errors.WORD_COUNT_EXCEEDED

  return null
}
