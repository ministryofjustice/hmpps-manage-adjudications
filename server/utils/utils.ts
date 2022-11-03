import moment from 'moment'
import { SubmittedDateTime } from '../@types/template'
import { EvidenceCode, EvidenceDetails } from '../data/DraftAdjudicationResult'

const DATE_TIME_FORMAT_SPEC = 'YYYY-MM-DDTHH:mm:ss'

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

export const getFormattedOfficerName = (name: string): string => {
  if (!name) {
    return null
  }
  const names = name.split(' ')
  return `${names[0][0]}. ${names.reverse()[0]}`
}

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const convertNameForPlaceholder = (name: string, prisonerView: boolean): string => {
  const formattedName = convertToTitleCase(name)
  if (prisonerView) return getFormattedOfficerName(formattedName)
  return formattedName
}

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
  const dateTime = buildDateTime({
    date: userSubmittedDateTime.date,
    hours: userSubmittedDateTime.time.hour,
    minutes: userSubmittedDateTime.time.minute,
  })

  const momentDate = moment(dateTime)

  if (!momentDate.isValid()) return null

  return momentDate.format('YYYY-MM-DDTHH:mm')
}

export const momentDateToDatePicker = (mom: moment.Moment): string => mom.format('DD/MM/YYYY')

export const datePickerDateToMoment = (dataPicker: string): moment.Moment => moment(dataPicker, 'DD/MM/YYYY')

export const momentDateToApi = (mom: moment.Moment): string => mom.format('YYYY-MM-DD')

export const hasAnyRole = (requiredRoles: string[], userRoles: string[]): boolean =>
  !requiredRoles || (!!userRoles && requiredRoles.some(role => userRoles.includes(role)))

export const formatTimestampToDate = (timestamp: string, format = 'DD/MM/YYYY'): string =>
  formatTimestampTo(timestamp, format)

export const formatTimestampToTime = (timestamp: string, format = 'HH:mm'): string =>
  formatTimestampTo(timestamp, format)

export const formatTimestampTo = (timestamp: string, format: string): string =>
  timestamp && moment(timestamp).format(format)

export const numberRange = (start: number, end: number): number[] => generateRange(start, end, _ => _)

export function generateRange<T>(start: number, end: number, generator: (index: number) => T): T[] {
  return Array(end - start + 1)
    .fill(null)
    .map((_, idx) => generator(start + idx))
}

export const isValidDateTimeFormat = (dateTimeString: string): boolean =>
  moment(dateTimeString, DATE_TIME_FORMAT_SPEC, true).isValid()

export const getDate = (dateTimeString: string, format = 'dddd D MMMM YYYY'): string => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format(format)
}

export const getTime = (dateTimeString: string): string => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format('HH:mm')
}

export const possessive = (string: string): string => {
  if (!string) return ''
  return `${string}${string.toLowerCase().endsWith('s') ? '’' : '’s'}`
}

export const calculateAge = (dateOfBirth: string, dateOfIncident: string) => {
  if (!dateOfBirth) return null
  const incidentDate: Date = new Date(dateOfIncident)
  const birthday: Date = new Date(dateOfBirth)
  const dateDifference = moment.duration(Number(birthday) - Number(incidentDate))
  return {
    years: Math.abs(dateDifference.years()),
    months: Math.abs(dateDifference.months()),
  }
}

export const getEvidenceCategory = (
  evidenceArray: EvidenceDetails[],
  isBaggedAndTagged: boolean
): EvidenceDetails[] => {
  if (!evidenceArray) return []
  if (isBaggedAndTagged) {
    return evidenceArray.filter(evidenceItem => evidenceItem.code === EvidenceCode.BAGGED_AND_TAGGED)
  }
  return evidenceArray.filter(evidenceItem => evidenceItem.code !== EvidenceCode.BAGGED_AND_TAGGED)
}

export const convertDateTimeToObject = (dateTime: string): { date: string; time: { hour: string; minute: string } } => {
  if (!dateTime || !isValidDateTimeFormat(dateTime)) return null
  const date = getDate(dateTime, 'DD/MM/YYYY')
  const time = getTime(dateTime)
  const hour = time.split(':')[0]
  const minute = time.split(':')[1]
  return { date, time: { hour, minute } }
}

export default {
  numberRange,
  convertToTitleCase,
  formatLocation,
  formatDate,
  getTime,
  getDate,
  hasAnyRole,
  getFormattedOfficerName,
  possessive,
  calculateAge,
  convertNameForPlaceholder,
  getEvidenceCategory,
}
