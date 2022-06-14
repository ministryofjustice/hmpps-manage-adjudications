import { FormError } from '../../@types/template'

type AgeOfPrisonerForm = {
  whichRuleChosen: string
}

const errors: { [key: string]: FormError } = {
  RADIO_OPTION_MISSING: {
    href: '#whichRuleChosen',
    text: 'Select which rules apply.',
  },
}

export default function validateForm({ whichRuleChosen }: AgeOfPrisonerForm): FormError | null {
  if (!whichRuleChosen) return errors.RADIO_OPTION_MISSING
  return null
}
