import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  rehabChoice: string
  numberOfActivities: number
}

const errors: { [key: string]: FormError } = {
  MISSING_REHAB_CHOICE: {
    href: '#isThereRehabilitativeActivities',
    text: 'Select yes if there is a rehabilitative activity condition',
  },
  MISSING_NO_OF_ACTIVITIES: {
    href: '#numberOfActivities',
    text: 'Enter the number of rehabilitative activities',
  },
}

export default function validateForm({ rehabChoice, numberOfActivities }: PunishmentForm): FormError | null {
  if (!rehabChoice) {
    return errors.MISSING_REHAB_CHOICE
  }

  if (rehabChoice === 'YES' && !numberOfActivities) {
    return errors.MISSING_NO_OF_ACTIVITIES
  }

  return null
}
