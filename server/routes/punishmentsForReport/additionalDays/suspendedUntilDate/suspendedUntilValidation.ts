import moment from 'moment'
import { FormError } from '../../../../@types/template'
import { parseDatePickerDate } from '../../punishmentBatch/duration/durationValidation'

type SuspendedUntilDateForm = {
  suspendedUntil?: string
  lastHearingDate?: string
  lastSuspendedDate?: string
}

export default function validateForm({
  suspendedUntil,
  lastHearingDate,
  lastSuspendedDate,
}: SuspendedUntilDateForm): FormError | null {
  const date = parseDatePickerDate(suspendedUntil)
  const hearingDayText = lastHearingDate ? moment(lastHearingDate).format('D MMMM YYYY') : ''
  const lastSuspendedDayText = lastSuspendedDate ? moment(lastSuspendedDate).format('D MMMM YYYY') : ''

  if (!date) {
    return {
      href: '#suspendedUntil',
      text: 'Enter the date the punishment is suspended until',
    }
  }
  if (lastHearingDate && !date.isAfter(lastHearingDate, 'day')) {
    return {
      href: '#suspendedUntil',
      text: `Date suspended until must be after the last day of the hearing, ${hearingDayText}`,
    }
  }
  if (lastSuspendedDate && date.isAfter(lastSuspendedDate, 'day')) {
    return {
      href: '#suspendedUntil',
      text: `Date suspended cannot be later than 6 months after the last day of the hearing, ${lastSuspendedDayText}`,
    }
  }
  return null
}
