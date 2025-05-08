import { FormError, SubmittedDateTime } from '../../@types/template'
import { formatDate } from '../../utils/utils'

type incidentDetailsForm = {
  incidentDate?: SubmittedDateTime
  discoveryDate?: SubmittedDateTime
  locationUuid: string
  incidentRole?: string
  associatedPrisonersNumber?: string
  discoveryRadioSelected?: string
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
    href: '#locationUuid',
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
  DISCOVERY_MISSING_RADIO: {
    href: '#discoveryRadioSelected',
    text: 'Select yes if the incident was discovered at the same time',
  },
  DISCOVERY_MISSING_DATE: {
    href: '#discoveryDate[date]',
    text: 'Enter the date of the incident discovery',
  },
  DISCOVERY_MISSING_TIME: {
    href: '#discoveryDate[time]',
    text: 'Enter the time of the discovery',
  },
  DISCOVERY_MISSING_HOUR: {
    href: '#discoveryDate[time][hour]',
    text: 'Enter an incident discovery hour between 00 and 23',
  },
  DISCOVERY_MISSING_MINUTE: {
    href: '#discoveryDate[time][minute]',
    text: 'Enter the discovery minute between 00 and 59',
  },
  DISCOVERY_FUTURE_TIME: {
    href: '#discoveryDate[date]',
    text: 'The incident discovery time must be in the past',
  },
  DISCOVERY_AFTER_INCIDENT_DATE: {
    href: '#discoveryDate[date]',
    text: 'The discovery date must be after the incident date',
  },
  DISCOVERY_AFTER_INCIDENT_TIME: {
    href: '#discoveryDate[time][minute]',
    text: 'The discovery time must be after the incident time',
  },
}

export default function validateForm({
  incidentDate,
  discoveryDate,
  locationUuid,
  discoveryRadioSelected,
}: incidentDetailsForm): FormError | null {
  if (!discoveryRadioSelected) {
    return errors.DISCOVERY_MISSING_RADIO
  }

  if (discoveryRadioSelected === 'No') {
    if (!discoveryDate.date) {
      return errors.DISCOVERY_MISSING_DATE
    }
    if (!discoveryDate.time.hour || !discoveryDate.time.minute) {
      return errors.DISCOVERY_MISSING_TIME
    }
    if (
      Number.isNaN(Number(discoveryDate.time.hour)) ||
      Number(discoveryDate.time.hour) < 0 ||
      Number(discoveryDate.time.hour) > 23
    ) {
      return errors.DISCOVERY_MISSING_HOUR
    }
    if (
      Number.isNaN(Number(discoveryDate.time.minute)) ||
      Number(discoveryDate.time.minute) < 0 ||
      Number(discoveryDate.time.minute) > 59
    ) {
      return errors.DISCOVERY_MISSING_MINUTE
    }
    if (new Date(formatDate(discoveryDate)) > new Date()) {
      return errors.DISCOVERY_FUTURE_TIME
    }
    if (discoveryDate.date === incidentDate.date) {
      if (new Date(formatDate(discoveryDate)) < new Date(formatDate(incidentDate))) {
        return errors.DISCOVERY_AFTER_INCIDENT_TIME
      }
    }
    if (new Date(formatDate(discoveryDate)) < new Date(formatDate(incidentDate))) {
      return errors.DISCOVERY_AFTER_INCIDENT_DATE
    }
  }

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
  if (!locationUuid) {
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
