import moment from 'moment'
import { SubmittedDateTime } from '../@types/template'
import { DraftAdjudication, EvidenceCode, EvidenceDetails } from '../data/DraftAdjudicationResult'
import { ReportedAdjudication } from '../data/ReportedAdjudicationResult'

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
  if (names.length < 2) return properCaseName(name)
  return `${names[0][0].toUpperCase()}. ${properCaseName(names.reverse()[0])}`
}

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const convertNameForPlaceholder = (name: string, prisonerView: boolean): string => {
  const formattedName = convertToTitleCase(name)
  if (prisonerView) return getFormattedOfficerName(formattedName)
  return formattedName
}

export const formatLocation = (locationName: string): string => {
  if (!locationName) return 'Unknown'
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

export const apiDateToDatePicker = (apiDate: string): string => momentDateToDatePicker(moment(apiDate, 'YYYY-MM-DD'))

export const momentDateToApi = (mom: moment.Moment): string => mom.format('YYYY-MM-DD')

export const datePickerToApi = (dataPicker: string): string => momentDateToApi(datePickerDateToMoment(dataPicker))

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
  return getDateOrTime(dateTimeString, format)
}

export const getFullDate = (dateTimeString: string, format = 'D MMMM YYYY'): string => {
  return getDateOrTime(dateTimeString, format)
}

export const getTime = (dateTimeString: string, format = 'HH:mm'): string => {
  return getDateOrTime(dateTimeString, format)
}

const getDateOrTime = (dateTimeString: string, format: string): string => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'
  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format(format)
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

export const convertDateTimeStringToSubmittedDateTime = (
  dateTime: string
): { date: string; time: { hour: string; minute: string } } => {
  if (!dateTime || !isValidDateTimeFormat(dateTime)) return null
  const date = getDate(dateTime, 'DD/MM/YYYY')
  const time = getTime(dateTime)
  const hour = time.split(':')[0]
  const minute = time.split(':')[1]
  return { date, time: { hour, minute } }
}

export const convertSubmittedDateTimeToDateObject = (
  userProvidedValue?: SubmittedDateTime
): { date: string; hour: string; minute: string } => {
  if (userProvidedValue) {
    const {
      date,
      time: { hour, minute },
    } = userProvidedValue
    return { date, hour, minute }
  }
  return null
}

export const wordLimitExceedingString =
  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phase'

export const convertOicHearingType = (hearingType: string): string => {
  if (!hearingType) return null
  const hearingTypeSplit = hearingType.split('_')
  if (hearingTypeSplit[0] === 'GOV') return 'Governor'
  return 'Independent Adjudicator'
}

export const calculatePunishmentEndDate = (
  startDate: string,
  numberOfDaysOfPunishment: number,
  format = 'D MMMM YYYY'
) => {
  return moment(datePickerDateToMoment(startDate))
    .add(numberOfDaysOfPunishment - 1, 'days')
    .format(format)
}

export const formatReportingOfficer = (
  reporterName: string,
  adjudication: DraftAdjudication | ReportedAdjudication
): string => {
  let reportingOfficer: string = getFormattedOfficerName(reporterName)
  if (adjudication.createdOnBehalfOfOfficer) {
    reportingOfficer = reportingOfficer.concat(` on behalf of ${adjudication.createdOnBehalfOfOfficer}`)
  }
  return reportingOfficer
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
  formatReportingOfficer,
}
