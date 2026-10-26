import type { FormError } from '../../../../@types/template'

type SameActivityForm = {
  sameForAll?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_CHOICE: {
    href: '#sameForAll',
    text: 'Select yes if they all have the same rehabilitative activity',
  },
}

export default function validateForm({ sameForAll }: SameActivityForm): FormError | null {
  if (!['YES', 'NO'].includes(sameForAll)) {
    return errors.MISSING_CHOICE
  }
  return null
}
