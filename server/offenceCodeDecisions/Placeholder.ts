import PrisonerResult from '../data/prisonerResult'
import { convertNameForPlaceholder, convertToTitleCase, possessive } from '../utils/utils'
import { User } from '../data/hmppsAuthClient'

export type PlaceholderValues = {
  prisonerFirstName: string
  prisonerLastName: string
  associatedPrisonerFirstName?: string
  associatedPrisonerLastName?: string
  victimStaffFullName?: string
  victimPrisonerFirstName?: string
  victimPrisonerLastName?: string
  victimPrisonerNumber?: string
  victimOtherPersonFullName?: string
}

export type AnswerDataDetails = {
  victimStaff?: User
  victimPrisoner?: PrisonerResult
  victimOtherPerson?: string
  victimPrisonerNumber?: string
}

export enum PlaceholderText {
  PRISONER_FULL_NAME = '{PRISONER_FULL_NAME}',
  PRISONER_FULL_NAME_POSSESSIVE = '{PRISONER_FULL_NAME_POSSESSIVE}',
  ASSOCIATED_PRISONER_FULL_NAME = '{ASSOCIATED_PRISONER_FULL_NAME}',
  VICTIM_STAFF_FULL_NAME = '{VICTIM_STAFF_FULL_NAME}',
  VICTIM_PRISONER_FULL_NAME = '{VICTIM_PRISONER_FULL_NAME}',
  VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT = '{VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}',
  VICTIM_OTHER_PERSON_FULL_NAME = '{VICTIM_OTHER_PERSON_FULL_NAME}',
}

export function getPlaceholderValues(
  prisoner: PrisonerResult,
  associatedPrisoner?: PrisonerResult,
  answerDataDetails?: AnswerDataDetails
): PlaceholderValues {
  return {
    prisonerFirstName: prisoner.firstName,
    prisonerLastName: prisoner.lastName,
    associatedPrisonerFirstName: associatedPrisoner?.firstName,
    associatedPrisonerLastName: associatedPrisoner?.lastName,
    victimStaffFullName: answerDataDetails?.victimStaff?.name,
    victimPrisonerFirstName: answerDataDetails?.victimPrisoner?.firstName,
    victimPrisonerLastName: answerDataDetails?.victimPrisoner?.lastName,
    victimPrisonerNumber: answerDataDetails?.victimPrisonerNumber,
    victimOtherPersonFullName: answerDataDetails?.victimOtherPerson,
  }
}

export function getProcessedText(template: string, values: PlaceholderValues, prisonerView: boolean): string {
  return (template || '')
    .replace(
      PlaceholderText.PRISONER_FULL_NAME,
      convertToTitleCase(`${values.prisonerFirstName || ''} ${values.prisonerLastName || ''}`)
    )
    .replace(
      PlaceholderText.PRISONER_FULL_NAME_POSSESSIVE,
      possessive(convertToTitleCase(`${values.prisonerFirstName || ''} ${values.prisonerLastName || ''}`))
    )
    .replace(
      PlaceholderText.ASSOCIATED_PRISONER_FULL_NAME,
      convertToTitleCase(`${values.associatedPrisonerFirstName || ''} ${values.associatedPrisonerLastName || ''}`)
    )
    .replace(
      PlaceholderText.VICTIM_STAFF_FULL_NAME,
      convertNameForPlaceholder(values.victimStaffFullName || '', prisonerView)
    )
    .replace(
      PlaceholderText.VICTIM_PRISONER_FULL_NAME,
      convertToTitleCase(`${values.victimPrisonerFirstName || ''} ${values.victimPrisonerLastName || ''}`)
    )
    .replace(PlaceholderText.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT, formatPrisonerOutsideEstablishmentText(values))
    .replace(PlaceholderText.VICTIM_OTHER_PERSON_FULL_NAME, convertToTitleCase(values.victimOtherPersonFullName || ''))
}

function formatPrisonerOutsideEstablishmentText(values: PlaceholderValues): string {
  let text = convertToTitleCase(`${values.victimOtherPersonFullName || ''}`)
  if (values.victimPrisonerNumber) {
    text = text.concat(` ${values.victimPrisonerNumber}`)
  }
  return text
}
