import { FormError } from '../../@types/template'

type SearchForm = {
  staffFirstName?: string
  staffLastName?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_PRISON_OFFICER_INPUT: {
    href: '#assaultedPrisonOfficerFullName',
    text: 'Enter their name',
  },
  MISSING_PRISON_OFFICER_INPUT_FIRST: {
    href: '#assaultedPrisonOfficerFirstname',
    text: 'Enter their first name',
  },
  MISSING_PRISON_OFFICER_INPUT_LAST: {
    href: '#assaultedPrisonOfficerLastname',
    text: 'Enter their last name',
  },
}

export default function validateForm({ staffFirstName, staffLastName }: SearchForm): FormError | null {
  if (!staffFirstName && !staffLastName) {
    return errors.MISSING_PRISON_OFFICER_INPUT
  }
  if (!staffFirstName) {
    return errors.MISSING_PRISON_OFFICER_INPUT_FIRST
  }
  if (!staffLastName) {
    return errors.MISSING_PRISON_OFFICER_INPUT_LAST
  }
  return null
}
