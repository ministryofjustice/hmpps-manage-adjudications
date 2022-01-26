import { FormError } from '../../@types/template'

type SearchForm = {
  searchFirstName?: string
  searchLastName?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_NAME: {
    href: '#searchFullName',
    text: 'Enter their name',
  },
  MISSING_FIRST_NAME: {
    href: '#searchFirstName',
    text: 'Enter their first name',
  },
  MISSING_LAST_NAME: {
    href: '#searchLastName',
    text: 'Enter their last name',
  },
}

export default function validateForm({ searchFirstName, searchLastName }: SearchForm): FormError | null {
  if (!searchFirstName && !searchLastName) {
    return errors.MISSING_NAME
  }
  if (!searchFirstName) {
    return errors.MISSING_FIRST_NAME
  }
  if (!searchLastName) {
    return errors.MISSING_LAST_NAME
  }

  return null
}
