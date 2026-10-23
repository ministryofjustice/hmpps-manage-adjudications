import { FormError } from '../../../../@types/template'

type SameDurationForm = {
  sameForAll?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_CHOICE: {
    href: '#sameForAll',
    text: 'Select yes if they all have the same duration and start date',
  },
}

export default function validateForm({ sameForAll }: SameDurationForm): FormError | null {
  if (!['yes', 'no'].includes(sameForAll)) return errors.MISSING_CHOICE
  return null
}
