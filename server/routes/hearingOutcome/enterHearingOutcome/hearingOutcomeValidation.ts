import { FormError } from '../../../@types/template'
import { OicHearingType } from '../../../data/ReportedAdjudicationResult'

type hearingOutcomeForm = {
  hearingOutcome: string
  inAdName: string
  governorId: string
  adjudicatorType: OicHearingType
}

const errors: { [key: string]: FormError } = {
  MISSING_NAME: {
    href: '#inAdName',
    text: 'Enter the name of the adjudicator',
  },
  MISSING_RADIO: {
    href: '#hearingOutcome',
    text: 'Select the next step after this hearing',
  },
  STAFF_MISSING_ID_SUBMIT: {
    href: '#governorName',
    text: 'Search for a governor',
  },
}

export default function validateForm({
  hearingOutcome,
  inAdName,
  governorId,
  adjudicatorType,
}: hearingOutcomeForm): FormError | null {
  if (adjudicatorType.includes('GOV') && !governorId) {
    return errors.STAFF_MISSING_ID_SUBMIT
  }
  if (adjudicatorType.includes('INAD') && !inAdName) {
    return errors.MISSING_NAME
  }
  if (!hearingOutcome) {
    return errors.MISSING_RADIO
  }

  return null
}
