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
  ONE_DIGIT_HOUR: {
    href: '#incidentDate[time][hour]',
    text: 'Enter the hour using 2 numbers - for example, 08 or 18',
  },
  ONE_DIGIT_MINUTE: {
    href: '#incidentDate[time][minute]',
    text: 'Enter the minute using 2 numbers - for example, 08 or 18',
  },
  FUTURE_TIME: {
    href: '#incidentDate[time]',
    text: 'Enter an incident time that is not in the future.',
  },
  MISSING_ROLE: {
    href: '#currentRadioSelected',
    text: 'Select the prisoner’s role in this incident.',
  },
  MISSING_ASSOCIATED_PRISONER_INCITE: {
    href: '#incitedInput',
    text: 'Enter their name or prison number.',
  },
  MISSING_ASSOCIATED_PRISONER_ASSIST: {
    href: '#assistedInput',
    text: 'Enter their name or prison number.',
  },
}

export default function validateForm({
  incidentDate,
  locationId,
  incidentRole,
  associatedPrisonersNumber,
}: incidentDetailsForm): FormError | null {
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
  if (incidentDate.time.hour.length < 2) {
    return errors.ONE_DIGIT_HOUR
  }
  if (incidentDate.time.minute.length < 2) {
    return errors.ONE_DIGIT_MINUTE
  }
  if (new Date(formatDate(incidentDate)) > new Date()) {
    return errors.FUTURE_TIME
  }
  if (!incidentRole) {
    return errors.MISSING_ROLE
  }
  if (incidentRole === 'incited' && !associatedPrisonersNumber) {
    return errors.MISSING_ASSOCIATED_PRISONER_INCITE
  }
  if (incidentRole === 'assisted' && !associatedPrisonersNumber) {
    return errors.MISSING_ASSOCIATED_PRISONER_ASSIST
  }

  return null
}
