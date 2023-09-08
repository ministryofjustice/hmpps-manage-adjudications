import { FormError } from '../../@types/template'

export const errors: { [key: string]: FormError } = {
  MISSING_CREATED_ON_BEHALF_OF: {
    href: '#createdOnBehalfOfOfficer',
    text: 'Enter the new reporting officers name',
  },
}

export default function validateForm(createdOnBehalfOfOfficer: string): FormError | null {
  if (!createdOnBehalfOfOfficer) {
    return errors.MISSING_CREATED_ON_BEHALF_OF
  }

  return null
}
