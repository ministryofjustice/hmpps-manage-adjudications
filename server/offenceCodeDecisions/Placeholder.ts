import PrisonerResult from '../data/prisonerResult'
import { convertToTitleCase } from '../utils/utils'
import { User } from '../data/hmppsAuthClient'

export type PlaceholderValues = {
  prisonerFirstName: string
  prisonerLastName: string
  associatedPrisonerFirstName: string
  associatedPrisonerLastName: string
  victimStaffFullName: string
  victimPrisonerFirstName: string
  victimPrisonerLastName: string
  victimOtherPersonFullName: string
}

export type AnswerData = {
  victimStaff?: User
  victimPrisoner?: PrisonerResult
  victimOtherPerson?: string
}

// eslint-disable-next-line no-shadow
export const enum PlaceholderText {
  PRISONER_FULL_NAME = '{PRISONER_FULL_NAME}',
  ASSOCIATED_PRISONER_FULL_NAME = '{ASSOCIATED_PRISONER_FULL_NAME}',
  VICTIM_STAFF_FULL_NAME = '{VICTIM_STAFF_FULL_NAME}',
  VICTIM_PRISONER_FULL_NAME = '{VICTIM_PRISONER_FULL_NAME}',
  VICTIM_OTHER_PERSON_FULL_NAME = '{VICTIM_OTHER_PERSON_FULL_NAME}',
}

export function getPlaceholderValues(
  prisoner: PrisonerResult,
  associatedPrisoner?: PrisonerResult,
  answerData?: AnswerData
): PlaceholderValues {
  return {
    prisonerFirstName: convertToTitleCase(prisoner.firstName),
    prisonerLastName: convertToTitleCase(prisoner.lastName),
    associatedPrisonerFirstName: associatedPrisoner && convertToTitleCase(associatedPrisoner?.firstName),
    associatedPrisonerLastName: associatedPrisoner && convertToTitleCase(associatedPrisoner?.lastName),
    victimStaffFullName: answerData?.victimStaff && convertToTitleCase(answerData.victimStaff.name),
    victimPrisonerFirstName: answerData?.victimPrisoner && convertToTitleCase(answerData.victimPrisoner.firstName),
    victimPrisonerLastName: answerData?.victimPrisoner && convertToTitleCase(answerData.victimPrisoner.lastName),
    victimOtherPersonFullName: answerData?.victimOtherPerson,
  }
}

export function getProcessedText(template: string, placeholderValues: PlaceholderValues): string {
  return (template || '')
    .replace(
      PlaceholderText.PRISONER_FULL_NAME,
      `${placeholderValues.prisonerFirstName} ${placeholderValues.prisonerLastName}`
    )
    .replace(
      PlaceholderText.ASSOCIATED_PRISONER_FULL_NAME,
      `${placeholderValues.associatedPrisonerFirstName} ${placeholderValues.associatedPrisonerLastName}`
    )
    .replace(PlaceholderText.VICTIM_STAFF_FULL_NAME, placeholderValues.victimStaffFullName)
    .replace(
      PlaceholderText.VICTIM_PRISONER_FULL_NAME,
      `${placeholderValues.victimPrisonerFirstName} ${placeholderValues.victimPrisonerLastName}`
    )
    .replace(PlaceholderText.VICTIM_OTHER_PERSON_FULL_NAME, placeholderValues.victimOtherPersonFullName)
}
