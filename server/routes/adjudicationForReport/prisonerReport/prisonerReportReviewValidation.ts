import { FormError } from '../../../@types/template'

export enum ReviewStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
  SCHEDULED = 'SCHEDULED',
  UNSCHEDULED = 'UNSCHEDULED',
}

type reviewForm = {
  status?: ReviewStatus
  reason?: string
  details?: string
}

export const errors: { [key: string]: FormError } = {
  MISSING_STATUS: {
    href: '#currentStatusSelected',
    text: 'Enter a review outcome',
  },
  MISSING_REJECT_REASON: {
    href: '#rejectedReasonId',
    text: 'Enter a reason',
  },
  MISSING_RETURN_REASON: {
    href: '#returnedReasonId',
    text: 'Enter a reason',
  },
  MISSING_REJECT_DETAILS: {
    href: '#rejectedDetails',
    text: 'Enter supporting information',
  },
  REJECT_DETAILS_WORD_COUNT_EXCEEDED: {
    href: '#rejectedDetails',
    text: 'Your statement must be 4,000 characters or less',
  },
  MISSING_RETURN_DETAILS: {
    href: '#returnedDetails',
    text: 'Enter supporting information',
  },
  RETURN_DETAILS_WORD_COUNT_EXCEEDED: {
    href: '#returnedDetails',
    text: 'Your statement must be 4,000 characters or less',
  },
  ACCEPTED_DETAILS_WORD_COUNT_EXCEEDED: {
    href: '#acceptedDetails',
    text: 'Your statement must be 4,000 characters or less',
  },
}

export default function validateForm({ status, reason, details }: reviewForm): FormError[] | null {
  if (!status) return [errors.MISSING_STATUS]

  const returnedErrors: FormError[] = []
  if (status === ReviewStatus.REJECTED) {
    if (!reason) returnedErrors.push(errors.MISSING_REJECT_REASON)
    if (!details) returnedErrors.push(errors.MISSING_REJECT_DETAILS)

    if (returnedErrors.length !== 0) return returnedErrors

    if (details.length > 4000) return [errors.REJECT_DETAILS_WORD_COUNT_EXCEEDED]
  }
  if (status === ReviewStatus.RETURNED) {
    if (!reason) returnedErrors.push(errors.MISSING_RETURN_REASON)
    if (!details) returnedErrors.push(errors.MISSING_RETURN_DETAILS)
    if (returnedErrors.length !== 0) return returnedErrors
    if (details.length > 4000) return [errors.RETURN_DETAILS_WORD_COUNT_EXCEEDED]
  }

  if (status === ReviewStatus.ACCEPTED) {
    if (details.length > 4000) return [errors.ACCEPTED_DETAILS_WORD_COUNT_EXCEEDED]
  }

  return null
}
