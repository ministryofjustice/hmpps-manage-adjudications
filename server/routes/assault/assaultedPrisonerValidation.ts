import { FormError } from '../../@types/template'

type SearchForm = {
  searchTerm?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_PRISONER_INPUT: {
    href: '#assaultedPrisonerInput',
    text: 'Enter a prisoner’s name or number',
  },
}

export default function validateForm({ searchTerm }: SearchForm): FormError | null {
  if (!searchTerm) {
    return errors.MISSING_PRISONER_INPUT
  }
  return null
}
