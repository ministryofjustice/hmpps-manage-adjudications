import { FormError } from '../../@types/template'

export const errors: { [key: string]: FormError } = {
  MISSING_CREATED_ON_BEHALF_OF_REASON: {
    href: '#createdOnBehalfOfReason',
    text: 'Enter the reason why you are reporting this on their behalf',
  },
}

export default function validateForm(createdOnBehalfOfReason: string): FormError | null {
  if (!createdOnBehalfOfReason) {
    return errors.MISSING_CREATED_ON_BEHALF_OF_REASON
  }

  return null
}
