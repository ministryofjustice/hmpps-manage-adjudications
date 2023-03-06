import { FormError } from '../../../@types/template'

type CautionForm = {
  caution: string
}

const errors: { [key: string]: FormError } = {
  MISSING_CAUTION_CHOICE: {
    href: '#caution',
    text: 'Select yes if the punishment is a caution',
  },
}

export default function validateForm({ caution }: CautionForm): FormError | null {
  if (!caution) {
    return errors.MISSING_CAUTION_CHOICE
  }

  return null
}
