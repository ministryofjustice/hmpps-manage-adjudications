import { FormError, SubmittedDateTime } from '../../../@types/template'
import { formatDate } from '../../../utils/utils'

type ScheduleHearingForm = {
  hearingDate?: SubmittedDateTime
  locationId?: number
  hearingType?: string
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
  PAST_TIME: {
    href: '#hearingDate[time][hour]',
    text: 'The hearing time must be in the future',
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
    text: 'The date and time of this hearing must be after the date and time of the previous hearing',
  },
}

export default function validateForm({ hearingDate, locationId, hearingType }: ScheduleHearingForm): FormError | null {
  if (!hearingType) {
    return errors.MISSING_HEARING_TYPE
  }
  if (!locationId) {
    return errors.MISSING_LOCATION
  }
  if (!hearingDate.date) {
    return errors.MISSING_DATE
  }
  if (!hearingDate.time?.hour || !hearingDate.time?.minute) {
    return errors.MISSING_TIME
  }
  if (new Date(formatDate(hearingDate)) < new Date()) {
    return errors.PAST_TIME
  }

  return null
}
