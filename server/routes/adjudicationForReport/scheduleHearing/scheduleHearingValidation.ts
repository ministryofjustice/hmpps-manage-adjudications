import { FormError, SubmittedDateTime } from '../../../@types/template'
import { formatDate, formatTimestampToDate, formatTimestampToTime } from '../../../utils/utils'

type ScheduleHearingForm = {
  hearingDate?: SubmittedDateTime
  locationId?: string // TODO: MAP-2114: remove at a later date
  locationUuid?: string
  hearingType?: string
  latestExistingHearing?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DATE: {
    href: '#hearingDate[date]',
    text: 'Enter date of hearing',
  },
  MISSING_TIME: {
    href: '#hearingDate[time][hour]',
    text: 'Select time of hearing',
  },
  MISSING_LOCATION: {
    href: '#locationId',
    text: 'Select location of hearing',
  },
  MISSING_HEARING_TYPE: {
    href: '#hearingType',
    text: 'Select type of hearing',
  },
  DATE_BEFORE_PREVIOUS_HEARING: {
    href: '#hearingDate[date]',
    text: 'The date of this hearing must be after the date of the previous hearing',
  },
  TIME_BEFORE_PREVIOUS_HEARING: {
    href: '#hearingDate[time][hour]',
    text: 'The time of this hearing must be after the time of the previous hearing',
  },
}

export default function validateForm({
  hearingDate,
  locationId,
  hearingType,
  latestExistingHearing,
}: ScheduleHearingForm): FormError[] | null {
  if (!hearingType) {
    return [errors.MISSING_HEARING_TYPE]
  }
  if (!locationId) {
    return [errors.MISSING_LOCATION]
  }
  if (!hearingDate.date) {
    return [errors.MISSING_DATE]
  }
  if (!hearingDate.time?.hour || !hearingDate.time?.minute) {
    return [errors.MISSING_TIME]
  }
  if (
    formatTimestampToDate(formatDate(hearingDate), 'YYYY-MM-DD') <
      formatTimestampToDate(latestExistingHearing, 'YYYY-MM-DD') &&
    formatTimestampToTime(formatDate(hearingDate)) < formatTimestampToTime(latestExistingHearing)
  ) {
    return [errors.DATE_BEFORE_PREVIOUS_HEARING, errors.TIME_BEFORE_PREVIOUS_HEARING]
  }
  if (
    formatTimestampToDate(formatDate(hearingDate), 'YYYY-MM-DD') <
    formatTimestampToDate(latestExistingHearing, 'YYYY-MM-DD')
  ) {
    return [errors.DATE_BEFORE_PREVIOUS_HEARING]
  }
  if (
    formatTimestampToDate(formatDate(hearingDate), 'YYYY-MM-DD') ===
      formatTimestampToDate(latestExistingHearing, 'YYYY-MM-DD') &&
    formatTimestampToTime(formatDate(hearingDate)) <= formatTimestampToTime(latestExistingHearing)
  ) {
    return [errors.TIME_BEFORE_PREVIOUS_HEARING]
  }

  return null
}
