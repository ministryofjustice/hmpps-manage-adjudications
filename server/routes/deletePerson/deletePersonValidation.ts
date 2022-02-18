import { FormError } from '../../@types/template'

const errors: { [key: string]: FormError } = {
  MISSING_RADIO: {
    href: '#delete-person',
    text: 'Select yes if you want to delete this person.',
  },
}

export default function validateForm({ deletePerson }: { deletePerson: string }): FormError | null {
  if (!deletePerson) {
    return errors.MISSING_RADIO
  }
  return null
}
