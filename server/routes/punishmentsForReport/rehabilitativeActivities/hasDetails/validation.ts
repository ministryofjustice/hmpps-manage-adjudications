import { FormError } from '../../../../@types/template'

type PunishmentForm = {
  hasDetails: boolean
}

type BatchForm = {
  hasDetails: string
  numberOfActivities: string
}

export const MAX_ACTIVITIES = 10

const errors: { [key: string]: FormError } = {
  MISSING_CHOICE: {
    href: '#hasRehabilitativeActivitiesDetails',
    text: 'Select yes if you have the details of the rehabilitative activity',
  },
  MISSING_CHOICE_BATCH: {
    href: '#hasRehabilitativeActivitiesDetails',
    text: 'Select yes if you have the details of the rehabilitative activities',
  },
  MISSING_NO_OF_ACTIVITIES: {
    href: '#numberOfActivities',
    text: 'Enter the number of rehabilitative activities',
  },
  NOT_A_NUMBER: {
    href: '#numberOfActivities',
    text: 'Number of rehabilitative activities must be a whole number, like 1',
  },
  TOO_MANY: {
    href: '#numberOfActivities',
    text: `Number of rehabilitative activities must be ${MAX_ACTIVITIES} or fewer`,
  },
}

export default function validateForm({ hasDetails }: PunishmentForm): FormError | null {
  if (!hasDetails) {
    return errors.MISSING_CHOICE
  }

  return null
}

export function validateBatchForm({ hasDetails, numberOfActivities }: BatchForm): FormError | null {
  if (!['YES', 'NO'].includes(hasDetails)) return errors.MISSING_CHOICE_BATCH
  if (hasDetails === 'NO') return null
  if (!numberOfActivities) return errors.MISSING_NO_OF_ACTIVITIES
  if (!/^\d+$/.test(numberOfActivities) || Number(numberOfActivities) < 1) return errors.NOT_A_NUMBER
  if (Number(numberOfActivities) > MAX_ACTIVITIES) return errors.TOO_MANY
  return null
}
