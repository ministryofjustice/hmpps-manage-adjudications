import { FormError } from '../../@types/template'

export enum ReviewStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
}

type reviewForm = {
  status?: ReviewStatus
  reason?: string
  details?: string
}

export const errors: { [key: string]: FormError } = {
  MISSING_STATUS: {
    href: '#currentStatusSelected',
    text: 'A review outcome is required',
  },
  MISSING_REJECT_REASON: {
    href: '#rejectedReasonId',
    text: 'A reason is required',
  },
  MISSING_RETURN_REASON: {
    href: '#returnedReasonId',
    text: 'A reason is required',
  },
  MISSING_REJECT_DETAILS: {
    href: '#rejectedDetails',
    text: 'Supporting information is required for the selected reason',
  },
  REJECT_DETAILS_WORD_COUNT_EXCEEDED: {
    href: '#rejectedDetails',
    text: 'Write your details using 4,000 characters or less',
  },
  MISSING_RETURN_DETAILS: {
    href: '#returnedDetails',
    text: 'Supporting information is required for the selected reason',
  },
  RETURN_DETAILS_WORD_COUNT_EXCEEDED: {
    href: '#returnedDetails',
    text: 'Write your details using 4,000 characters or less',
  },
}

export default function validateForm({ status, reason, details }: reviewForm): FormError | null {
  if (!status) return errors.MISSING_STATUS

  if (status === ReviewStatus.REJECTED) {
    if (!reason) return errors.MISSING_REJECT_REASON
    if (!details) return errors.MISSING_REJECT_DETAILS
    if (details.length > 4000) return errors.REJECT_DETAILS_WORD_COUNT_EXCEEDED
  }
  if (status === ReviewStatus.RETURNED) {
    if (!reason) return errors.MISSING_RETURN_REASON
    if (!details) return errors.MISSING_RETURN_DETAILS
    if (details.length > 4000) return errors.RETURN_DETAILS_WORD_COUNT_EXCEEDED
  }

  return null
}
