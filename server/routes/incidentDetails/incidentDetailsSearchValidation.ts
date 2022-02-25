import { FormError } from '../../@types/template'

type SearchForm = {
  searchTerm?: string
  inputId?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_PRISONER_INCITED: {
    href: '#incitedInput',
    text: 'Enter a prisoner’s name or number',
  },
  MISSING_PRISONER_ASSISTED: {
    href: '#assistedInput',
    text: 'Enter a prisoner’s name or number',
  },
}

export default function validateForm({ searchTerm, inputId }: SearchForm): FormError | null {
  if (!searchTerm) {
    return inputId === 'incited' ? errors.MISSING_PRISONER_INCITED : errors.MISSING_PRISONER_ASSISTED
  }
  return null
}
