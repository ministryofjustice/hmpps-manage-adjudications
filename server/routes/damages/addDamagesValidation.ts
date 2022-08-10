import { FormError } from '../../@types/template'

type addDamagesForm = {
  damageType: string
  damageDescription: string
}

const errors: { [key: string]: FormError } = {
  MISSING_TEXT: {
    href: '#damageDescription',
    text: 'Enter details about these damages',
  },
  RADIO_OPTION_MISSING: {
    href: '#damageType',
    text: 'Select what needs to be done',
  },
}

export default function validateForm({ damageDescription, damageType }: addDamagesForm): FormError | null {
  if (!damageType) return errors.RADIO_OPTION_MISSING
  if (!damageDescription) return errors.MISSING_TEXT

  return null
}
