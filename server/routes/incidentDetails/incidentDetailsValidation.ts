import { FormError, SubmittedDateTime } from '../../@types/template'
import { formatDate } from '../../utils/utils'

type incidentDetailsForm = {
  incidentDate?: SubmittedDateTime
  discoveryDate?: SubmittedDateTime
  locationId?: number
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
  MISSING_RADIO: {
    href: '#discoveryRadioSelected',
    text: 'Select an incident discovery time opttion',
  },
  MISSING_DISCOVERY_DATE: {
    href: '#discoveryDate[date]',
    text: 'Enter the date of the incident discovery',
  },
  MISSING_DISCOVERY_HOUR: {
    href: '#discoveryDate[time][hour]',
    text: 'Enter an incident discovery hour between 00 and 23',
  },
  MISSING_DISCOVERY_MINUTES: {
    href: '#discoveryDate[time][minute]',
    text: 'Enter the discovery minute using 2 numbers - for example, 08 or 18',
  },
  DISCOVERY_FUTURE_TIME: {
    href: '#DISCOVERYDate[time]',
    text: 'The incident discovery time must be in the past',
  },
}

export default function validateForm({
  incidentDate,
  discoveryDate,
  locationId,
  discoveryRadioSelected,
}: incidentDetailsForm): FormError | null {
  if (!discoveryRadioSelected) {
    return errors.MISSING_RADIO
  }

  if (discoveryRadioSelected === 'No') {
    if (!discoveryDate.date) {
      return errors.MISSING_DISCOVERY_DATE
    }
    if (!discoveryDate.time.hour && !discoveryDate.time.minute) {
      return errors.MISSING_DISCOVERY_TIME
    }
    if (!discoveryDate.time.hour) {
      return errors.MISSING_DISCOVERY_HOUR
    }
    if (!discoveryDate.time.minute) {
      return errors.MISSING_DISCOVERY_MINUTES
    }

    if (Number.isNaN(Number(discoveryDate.time.hour)) || Number(discoveryDate.time.hour) > 23) {
      return errors.MISSING_DISCOVERY_HOUR
    }
    if (
      Number.isNaN(Number(discoveryDate.time.minute)) ||
      Number(discoveryDate.time.minute) < 0 ||
      Number(discoveryDate.time.minute) > 59
    ) {
      return errors.MISSING_DISCOVERY_MINUTES
    }
    if (new Date(formatDate(discoveryDate)) > new Date()) {
      return errors.IDISCOVERY_FUTURE_TIME
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
