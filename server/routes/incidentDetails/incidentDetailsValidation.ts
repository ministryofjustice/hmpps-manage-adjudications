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
    text: 'Enter date of incident',
  },
  MISSING_HOUR: {
    href: '#incidentDate[time][hour]',
    text: 'Enter time of incident',
  },
  MISSING_MINUTE: {
    href: '#incidentDate[time][minute]',
    text: 'Enter time of incident',
  },
  MISSING_TIME: {
    href: '#incidentDate[time]',
    text: 'Enter time of incident',
  },
  INVALID_HOUR: {
    href: '#incidentDate[time][hour]',
    text: 'Enter an hour which is 23 or less',
  },
  INVALID_MIN: {
    href: '#incidentDate[time][minute]',
    text: 'Enter a minute which is 59 or less',
  },
  MISSING_LOCATION: {
    href: '#locationId',
    text: 'Select location of incident',
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
    text: 'Enter an incident time that is not in the future.',
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
