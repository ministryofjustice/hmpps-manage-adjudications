import { FormError } from '../../@types/template'

type StillInEstablishmentForm = {
  stillInEstablishment: string
}

const errors: { [key: string]: FormError } = {
  RADIO_OPTION_MISSING: {
    href: '#stillInEstablishment',
    text: 'Select yes if the prisoner is still in this establishment',
  },
}

export default function validateForm({ stillInEstablishment }: StillInEstablishmentForm): FormError | null {
  if (!stillInEstablishment) return errors.RADIO_OPTION_MISSING
  return null
}
