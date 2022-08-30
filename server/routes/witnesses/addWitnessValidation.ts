import { FormError } from '../../@types/template'

type radioButtons = {
  selectedWitnessId: string
}

const error: { [key: string]: FormError } = {
  MISSING_DECISION: {
    href: '#selectedAnswerId',
    text: 'Select an option',
  },
}

export default function validateRadioForm({ selectedWitnessId }: radioButtons): FormError | null {
  if (!selectedWitnessId) {
    return error.MISSING_NAME
  }

  return null
}
