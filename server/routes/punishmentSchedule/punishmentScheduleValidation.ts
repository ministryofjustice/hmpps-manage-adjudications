import { FormError } from '../../@types/template'

type PunishmentScheduleForm = {
  days: number
  suspended: string
  suspendedUntil?: string
  startDate?: string
  endDate?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DAYS: {
    href: '#days',
    text: 'Enter how many days the punishment will last',
  },
  MISSING_SUSPENDED_DECISION: {
    href: '#suspended',
    text: 'Select yes, if this punishment is to be suspended',
  },
  MISSING_SUSPENDED_UNTIL: {
    href: '#suspendedUntil',
    text: 'Enter the date the punishment is suspended until',
  },
  MISSING_START_DATE: {
    href: '#startDate',
    text: 'Enter the date this punishment will start',
  },
  MISSING_END_DATE: {
    href: '#endDate',
    text: 'Enter the last day of this punishment',
  },
}

export default function validateForm({
  days,
  suspended,
  suspendedUntil,
  startDate,
  endDate,
}: PunishmentScheduleForm): FormError | null {
  if (!days) return errors.MISSING_DAYS
  if (!suspended) return errors.MISSING_SUSPENDED_DECISION
  if (suspended === 'yes' && !suspendedUntil) return errors.MISSING_SUSPENDED_UNTIL
  if (suspended === 'no' && !startDate) return errors.MISSING_START_DATE
  if (suspended === 'no' && !endDate) return errors.MISSING_END_DATE

  return null
}
