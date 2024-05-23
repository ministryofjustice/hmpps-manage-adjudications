import { FormError } from '../../../../@types/template'

type CompletedForm = {
  completed: string
  prisonerName: string
}

export default function validateForm({ completed, prisonerName }: CompletedForm): FormError | null {
  if (!completed) {
    return {
      href: '#completed',
      text: `Select yes if ${prisonerName} completed the activity`,
    }
  }

  return null
}
