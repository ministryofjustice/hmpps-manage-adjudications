import { FormError } from '../../@types/template'

type SearchForm = {
  staffName?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_NAME: {
    href: '#staffName',
    text: 'Enter the person’s name',
  },
}

export default function validateForm({ staffName }: SearchForm): FormError | null {
  if (!staffName) {
    return errors.MISSING_NAME
  }
  return null
}
