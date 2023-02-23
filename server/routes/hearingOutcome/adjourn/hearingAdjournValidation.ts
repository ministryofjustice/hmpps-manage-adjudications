import { FormError } from '../../../@types/template'
import { HearingOutcomeAdjournReason, HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'

type adjournForm = {
  adjournReason: HearingOutcomeAdjournReason
  adjournDetails: string
  adjournPlea: HearingOutcomePlea
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON: {
    href: '#adjournReason',
    text: 'Enter the reason for the adjournment',
  },
  MISSING_DETAILS: {
    href: '#adjournDetails',
    text: 'Enter the details for the adjournment',
  },
  MISSING_PLEA: {
    href: '#adjournPlea',
    text: 'Select the plea for the offence',
  },
}

export default function validateForm({ adjournReason, adjournDetails, adjournPlea }: adjournForm): FormError | null {
  if (!adjournReason) {
    return errors.MISSING_REASON
  }

  if (!adjournDetails) {
    return errors.MISSING_DETAILS
  }

  if (!adjournPlea) {
    return errors.MISSING_PLEA
  }

  return null
}
