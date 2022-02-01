import { FormError } from '../../@types/template'

type SearchForm = {
  searchTerm?: string
  inputId?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_PRISONER_INCITED: {
    href: '#inciteAnotherPrisonerInput',
    text: 'Enter a prisoner’s name or number',
  },
  MISSING_PRISONER_ASSISTED: {
    href: '#assistAnotherPrisonerInput',
    text: 'Enter a prisoner’s name or number',
  },
}

export default function validateForm({ searchTerm, inputId }: SearchForm): FormError | null {
  if (!searchTerm) {
    return inputId === 'inciteAnotherPrisoner' ? errors.MISSING_PRISONER_INCITED : errors.MISSING_PRISONER_ASSISTED
  }
  return null
}
