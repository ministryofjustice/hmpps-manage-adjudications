import { FormError } from '../../@types/template'

export const errors: { [key: string]: FormError } = {
  MISSING_CREATED_ON_BEHALF_OF: {
    href: '#createdOnBehalfOfOfficer',
    text: 'Enter the new reporting officer’s name',
  },
  CREATED_ON_BEHALF_OF_LENGTH: {
    href: '#createdOnBehalfOfOfficer',
    text: 'The reporting officer’s name must be less than 32 characters',
  },
}

export default function validateForm(createdOnBehalfOfOfficer: string): FormError | null {
  if (!createdOnBehalfOfOfficer) {
    return errors.MISSING_CREATED_ON_BEHALF_OF
  }
  if (createdOnBehalfOfOfficer.length > 32) {
    return errors.CREATED_ON_BEHALF_OF_LENGTH
  }

  return null
}
