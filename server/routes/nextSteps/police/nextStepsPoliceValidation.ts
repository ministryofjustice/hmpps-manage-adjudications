import { FormError } from '../../../@types/template'

type NextStepsPoliceForm = {
  prosecutionChosen: string
  nextStepChosen: string
}

const errors: { [key: string]: FormError } = {
  MISSING_PROSECUTION_CHOICE: {
    href: '#prosecutionChosen',
    text: 'Missing selection',
  },
  MISSING_NEXT_STEP_CHOICE: {
    href: '#nextStepChosen',
    text: 'Select the next step',
  },
}

export default function validateForm({ prosecutionChosen, nextStepChosen }: NextStepsPoliceForm): FormError | null {
  if (!prosecutionChosen) {
    return errors.MISSING_PROSECUTION_CHOICE
  }

  if (prosecutionChosen === 'yes') return null

  if (!nextStepChosen) {
    return errors.MISSING_NEXT_STEP_CHOICE
  }

  return null
}
