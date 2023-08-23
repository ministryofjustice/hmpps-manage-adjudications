import { FormError } from '../../../@types/template'
import { PunishmentReasonForChange } from '../../../data/PunishmentResult'

type PunishmentForm = {
  reasonForChange?: PunishmentReasonForChange
  detailsOfChange?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON: {
    href: '#reasonForChange',
    text: 'Select a reason',
  },
  MISSING_DETAILS: {
    href: '#detailsOfChange',
    text: 'Enter more details',
  },
}

export default function validateForm({ reasonForChange, detailsOfChange }: PunishmentForm): FormError | null {
  if (!reasonForChange) return errors.MISSING_REASON
  if (!detailsOfChange) return errors.MISSING_DETAILS
  return null
}
