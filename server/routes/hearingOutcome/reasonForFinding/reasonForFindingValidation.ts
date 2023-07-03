import { FormError } from '../../../@types/template'

export default function validateForm({ reasonForFinding }: { reasonForFinding: string }): FormError | null {
  if (!reasonForFinding) {
    return {
      href: '#reasonForFinding',
      text: 'Enter the reason for this finding',
    }
  }
  if (reasonForFinding.length > 4000) {
    return {
      href: '#reasonForFinding',
      text: 'Your statement must be 4,000 characters or fewer',
    }
  }

  return null
}
