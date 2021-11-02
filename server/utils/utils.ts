import { SubmittedDateTime } from '../@types/template'

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

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const formatLocation = (locationName: string): string => {
  if (!locationName) return undefined
  if (locationName.includes('CSWAP')) return 'No cell allocated'
  return locationName
}

export const formatDateToISOString = (userSubmittedDateTime: SubmittedDateTime): string => {
  try {
    const dateArray = userSubmittedDateTime.date.split('/')
    return new Date(
      Number(dateArray[2]),
      Number(dateArray[1]) - 1,
      Number(dateArray[0]),
      Number(userSubmittedDateTime.time.hour),
      Number(userSubmittedDateTime.time.minute)
    ).toISOString()
  } catch {
    return null
  }
}

export default {
  convertToTitleCase,
  formatLocation,
  formatDateToISOString,
}
