import { FormError } from '../../@types/template'

type SearchForm = {
  firstName: string
  lastName: StaticRange
}

const errors: { [key: string]: FormError } = {
  MISSING_PRISON_OFFICER_INPUT: {
    href: '#assaultedPrisonOfficerFullName',
    text: 'Enter a name',
  },
  MISSING_PRISON_OFFICER_INPUT_FIRST: {
    href: '#assaultedPrisonOfficerFirstname',
    text: 'Enter a first name',
  },
  MISSING_PRISON_OFFICER_INPUT_LAST: {
    href: '#assaultedPrisonOfficerLastname',
    text: 'Enter a last name',
  },
}

export default function validateForm({ firstName, lastName }: SearchForm): FormError | null {
  if (!firstName && !lastName) {
    return errors.MISSING_PRISON_OFFICER_INPUT
  }
  if (!firstName) {
    return errors.MISSING_PRISON_OFFICER_INPUT_FIRST
  }
  if (!lastName) {
    return errors.MISSING_PRISON_OFFICER_INPUT_LAST
  }
  return null
}
