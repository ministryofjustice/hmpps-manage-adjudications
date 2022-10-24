import { FormError } from '../../@types/template'

const errors: { [key: string]: FormError } = {
  DISCOVERY_MISSING_RADIO: {
    href: '#deletePerson',
    text: 'Select yes if you want to delete this person',
  },
}

export default function validateForm({ deletePerson }: { deletePerson: string }): FormError | null {
  if (!deletePerson) {
    return errors.DISCOVERY_MISSING_RADIO
  }
  return null
}
