import { FormError } from '../../../@types/template'

type hearingOutcomeForm = {
  hearingOutcome: string
  adjudicatorName: string
}

const errors: { [key: string]: FormError } = {
  MISSING_NAME: {
    href: '#adjudicatorName',
    text: 'Enter the name of the adjudicator',
  },
  MISSING_RADIO: {
    href: '#hearingOutcome',
    text: 'Select the next step after this hearing',
  },
}

export default function validateForm({ hearingOutcome, adjudicatorName }: hearingOutcomeForm): FormError | null {
  if (!adjudicatorName) {
    return errors.MISSING_NAME
  }
  if (!hearingOutcome) {
    return errors.MISSING_RADIO
  }

  return null
}
