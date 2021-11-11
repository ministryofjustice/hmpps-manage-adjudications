import moment from 'moment'
import { SubmittedDateTime } from '../@types/template'

type DateTimeInput = {
  date: string
  hours: string
  minutes: string
  dateFormat?: string
}

export const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

export const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
export const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const formatName = (firstName: string, lastName: string): string =>
  [properCaseName(firstName), properCaseName(lastName)].filter(Boolean).join(' ')

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const formatLocation = (locationName: string): string => {
  if (!locationName) return undefined
  if (locationName.includes('CSWAP')) return 'No cell allocated'
  return locationName
}

const buildDateTime = ({ date, hours, minutes, dateFormat = 'DD/MM/YYYY' }: DateTimeInput) => {
  const time =
    date &&
    Number.isSafeInteger(Number.parseInt(hours, 10)) &&
    Number.isSafeInteger(Number.parseInt(minutes, 10)) &&
    moment(date, dateFormat)
  return time ? time.hour(Number(hours)).minutes(Number(minutes)) : ''
}

export const formatDate = (userSubmittedDateTime: SubmittedDateTime): string => {
  try {
    const dateTime = buildDateTime({
      date: userSubmittedDateTime.date,
      hours: userSubmittedDateTime.time.hour,
      minutes: userSubmittedDateTime.time.minute,
    })
    return moment(dateTime).format('YYYY-MM-DDTHH:mm')
  } catch {
    return null
  }
}

export const hasAnyRole = (requiredRoles: string[], userRoles: string[]): boolean =>
  !requiredRoles || (!!userRoles && requiredRoles.some(role => userRoles.includes(role)))

export const formatTimestampToDate = (timestamp: string, outputFormat = 'DD/MM/YYYY'): string =>
  timestamp && moment(timestamp).format(outputFormat)

export const formatTimestampToTime = (timestamp: string, format = 'HH:mm'): string =>
  timestamp && moment(timestamp).format(format)

export const numberRange = (start: number, end: number): number[] => Array(end - start + 1).map((_, idx) => start + idx)

export default {
  numberRange,
  convertToTitleCase,
  formatLocation,
  formatDate,
  hasAnyRole,
}
