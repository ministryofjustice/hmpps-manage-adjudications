import { FormError } from '../../../@types/template'

type NextStepsInadForm = {
  nextStepChosen: string
}

const errors: { [key: string]: FormError } = {
  MISSING_NEXT_STEP_CHOICE: {
    href: '#nextStepChosen',
    text: 'Select the next step',
  },
}

export default function validateForm({ nextStepChosen }: NextStepsInadForm): FormError | null {
  if (!nextStepChosen) {
    return errors.MISSING_NEXT_STEP_CHOICE
  }

  return null
}
