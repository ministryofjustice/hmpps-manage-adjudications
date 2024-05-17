import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  hasDetails: boolean
}

const errors: { [key: string]: FormError } = {
  MISSING_CHOICE: {
    href: '#hasRehabilitativeActivitiesDetails',
    text: 'Select yes if you have the details of the rehabilitative activity',
  },
}

export default function validateForm({ hasDetails }: PunishmentForm): FormError | null {
  if (!hasDetails) {
    return errors.MISSING_CHOICE
  }

  return null
}
