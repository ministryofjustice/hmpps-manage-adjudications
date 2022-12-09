import { FormError, SubmittedDateTime } from '../../@types/template'
import { formatDate } from '../../utils/utils'

const errors: { [key: string]: FormError } = {
  MISSING_DATE: {
    href: '#issuedDate[date]',
    text: 'Enter date of issue',
  },
  MISSING_HOUR: {
    href: '#issuedDate[time][hour]',
    text: 'Enter time of issue',
  },
  MISSING_MINUTE: {
    href: '#issuedDate[time][minute]',
    text: 'Enter time of issue',
  },
  MISSING_TIME: {
    href: '#issuedDate[time]',
    text: 'Enter time of issue',
  },
  INVALID_HOUR: {
    href: '#issuedDate[time][hour]',
    text: 'Enter an hour between 00 and 23',
  },
  INVALID_MIN: {
    href: '#issuedDate[time][minute]',
    text: 'Enter a minute between 00 and 59',
  },
  DIGITS_HOUR: {
    href: '#issuedDate[time][hour]',
    text: 'Enter the hour using 2 numbers - for example, 08 or 18',
  },
  DIGITS_MINUTE: {
    href: '#issuedDate[time][minute]',
    text: 'Enter the minute using 2 numbers - for example, 08 or 18',
  },
  FUTURE_TIME: {
    href: '#issuedDate[time]',
    text: 'The issue time must be in the past',
  },
}

export default function validateForm(issueDate: SubmittedDateTime): FormError | null {
  if (!issueDate.date) {
    return errors.MISSING_DATE
  }
  if (!issueDate.time.hour && !issueDate.time.minute) {
    return errors.MISSING_TIME
  }
  if (!issueDate.time.hour) {
    return errors.MISSING_HOUR
  }
  if (!issueDate.time.minute) {
    return errors.MISSING_MINUTE
  }
  if (Number.isNaN(Number(issueDate.time.hour)) || Number(issueDate.time.hour) > 23) {
    return errors.INVALID_HOUR
  }
  if (Number.isNaN(Number(issueDate.time.minute)) || Number(issueDate.time.minute) > 59) {
    return errors.INVALID_MIN
  }
  if (issueDate.time.hour.length !== 2) {
    return errors.DIGITS_HOUR
  }
  if (issueDate.time.minute.length !== 2) {
    return errors.DIGITS_MINUTE
  }
  if (new Date(formatDate(issueDate)) > new Date()) {
    return errors.FUTURE_TIME
  }
  return null
}
