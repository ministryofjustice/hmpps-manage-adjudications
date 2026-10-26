import { FormError } from '../../../../@types/template'

const errors: { [key: string]: FormError } = {
  MISSING_CHOICE: {
    href: '#addAgain',
    text: 'Select yes if you want to add this punishment again',
  },
}

export default function validateForm({ addAgain }: { addAgain: string }): FormError | null {
  if (addAgain !== 'YES' && addAgain !== 'NO') return errors.MISSING_CHOICE
  return null
}
