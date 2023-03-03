import { FormError } from '../../../@types/template'

export default function validateForm({ reasonForFinding }: { reasonForFinding: string }): FormError | null {
  if (!reasonForFinding) {
    return {
      href: '#reasonForFinding',
      text: 'Enter the reason for this finding',
    }
  }

  return null
}
