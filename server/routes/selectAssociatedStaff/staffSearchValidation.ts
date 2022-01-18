import { FormError } from '../../@types/template'

type SearchForm = {
  searchFirstName?: string
  searchLastName?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_NAME: {
    href: '#staffFullName',
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
    return errors.MISSING_PRISON_OFFICER_INPUT
  }
  if (!searchFirstName) {
    return errors.MISSING_PRISON_OFFICER_INPUT_FIRST
  }
  if (!searchLastName) {
    return errors.MISSING_PRISON_OFFICER_INPUT_LAST
  }

  return null
}
