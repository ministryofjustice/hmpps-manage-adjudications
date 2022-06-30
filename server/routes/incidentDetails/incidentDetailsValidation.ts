import { FormError, SubmittedDateTime } from '../../@types/template'
import { formatDate } from '../../utils/utils'

type incidentDetailsForm = {
  incidentDate?: SubmittedDateTime
  locationId?: number
  incidentRole?: string
  associatedPrisonersNumber?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DATE: {
    href: '#incidentDate[date]',
    text: 'Enter the date of the incident',
  },
  MISSING_HOUR: {
    href: '#incidentDate[time][hour]',
    text: 'Enter the time of the incident',
  },
  MISSING_MINUTE: {
    href: '#incidentDate[time][minute]',
    text: 'Enter the time of the incident',
  },
  MISSING_TIME: {
    href: '#incidentDate[time]',
    text: 'Enter the time of the incident',
  },
  INVALID_HOUR: {
    href: '#incidentDate[time][hour]',
    text: 'Enter an hour between 00 and 23',
  },
  INVALID_MIN: {
    href: '#incidentDate[time][minute]',
    text: 'Enter a minute between 00 and 59',
  },
  MISSING_LOCATION: {
    href: '#locationId',
    text: 'Select the location of the incident',
  },
  DIGITS_HOUR: {
    href: '#incidentDate[time][hour]',
    text: 'Enter the hour using 2 numbers - for example, 08 or 18',
  },
  DIGITS_MINUTE: {
    href: '#incidentDate[time][minute]',
    text: 'Enter the minute using 2 numbers - for example, 08 or 18',
  },
  FUTURE_TIME: {
    href: '#incidentDate[time]',
    text: 'The incident time must be in the past',
  },
}

export default function validateForm({ incidentDate, locationId }: incidentDetailsForm): FormError | null {
  if (!incidentDate.date) {
    return errors.MISSING_DATE
  }
  if (!incidentDate.time.hour && !incidentDate.time.minute) {
    return errors.MISSING_TIME
  }
  if (!incidentDate.time.hour) {
    return errors.MISSING_HOUR
  }
  if (!incidentDate.time.minute) {
    return errors.MISSING_MINUTE
  }
  if (!locationId) {
    return errors.MISSING_LOCATION
  }
  if (Number.isNaN(Number(incidentDate.time.hour)) || Number(incidentDate.time.hour) > 23) {
    return errors.INVALID_HOUR
  }
  if (Number.isNaN(Number(incidentDate.time.minute)) || Number(incidentDate.time.minute) > 59) {
    return errors.INVALID_MIN
  }
  if (incidentDate.time.hour.length !== 2) {
    return errors.DIGITS_HOUR
  }
  if (incidentDate.time.minute.length !== 2) {
    return errors.DIGITS_MINUTE
  }
  if (new Date(formatDate(incidentDate)) > new Date()) {
    return errors.FUTURE_TIME
  }

  return null
}
