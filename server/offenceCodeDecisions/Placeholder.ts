import PrisonerResult from '../data/prisonerResult'
import { properCaseName } from '../utils/utils'
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
    prisonerFirstName: properCaseName(prisoner.firstName),
    prisonerLastName: properCaseName(prisoner.lastName),
    associatedPrisonerFirstName: associatedPrisoner && properCaseName(associatedPrisoner?.firstName),
    associatedPrisonerLastName: associatedPrisoner && properCaseName(associatedPrisoner?.lastName),
    victimStaffFullName: answerData.victimStaff && answerData.victimStaff.name,
    victimPrisonerFirstName: answerData.victimPrisoner && properCaseName(answerData.victimPrisoner.firstName),
    victimPrisonerLastName: answerData.victimPrisoner && properCaseName(answerData.victimPrisoner.lastName),
    victimOtherPersonFullName: answerData.victimOtherPerson,
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
