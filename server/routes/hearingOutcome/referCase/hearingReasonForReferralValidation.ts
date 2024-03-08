import { FormError } from '../../../@types/template'
import { ReferGovReason } from '../../../data/HearingAndOutcomeResult'

type referralReasonForm = {
  referralReason: string
  referGovReason?: ReferGovReason
  referGovReasonPresent: boolean
}

const errors: { [key: string]: FormError } = {
  MISSING_REASON_GOV_TYPE: {
    href: '#referralReason',
    text: 'Enter the adjudicator’s comments about the referral',
  },
  MISSING_REASON_POLICE_TYPE: {
    href: '#referralReason',
    text: 'Enter the reason for the referral',
  },
  MISSING_GOV_REFERRAL_REASON: {
    href: '#referGovReason',
    text: 'Enter the reason for the referral',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#referralReason',
    text: 'Your statement must be 4,000 characters or fewer',
  },
}

export default function validateForm({
  referralReason,
  referGovReasonPresent,
  referGovReason,
}: referralReasonForm): FormError | null {
  if (referGovReasonPresent) {
    if (!referGovReason) return errors.MISSING_GOV_REFERRAL_REASON
    if (!referralReason) {
      return errors.MISSING_REASON_GOV_TYPE
    }
  }
  if (!referralReason) {
    return errors.MISSING_REASON_POLICE_TYPE
  }
  if (referralReason.length > 4000) return errors.WORD_COUNT_EXCEEDED

  return null
}
