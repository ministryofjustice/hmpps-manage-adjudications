import { FormError } from '../../@types/template'

type SearchForm = {
  staffFirstName?: string
  staffLastName?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_NAME: {
    href: '#staffFullName',
    text: 'Enter their name',
  },
  MISSING_FIRST_NAME: {
    href: '#staffFirstName',
    text: 'Enter their first name',
  },
  MISSING_LAST_NAME: {
    href: '#staffLastName',
    text: 'Enter their last name',
  },
}

export default function validateForm({ staffFirstName, staffLastName }: SearchForm): FormError | null {
  if (!staffFirstName && !staffLastName) {
    return errors.MISSING_NAME
  }
  if (!staffFirstName) {
    return errors.MISSING_FIRST_NAME
  }
  if (!staffLastName) {
    return errors.MISSING_LAST_NAME
  }

  return null
}
