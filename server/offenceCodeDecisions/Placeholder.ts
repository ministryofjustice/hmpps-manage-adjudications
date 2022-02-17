import PrisonerResult from '../data/prisonerResult'
import { properCaseName } from '../utils/utils'

export type PlaceholderValues = {
  prisonerFirstName: string
  prisonerLastName: string
  associatedPrisonerFirstName: string
  associatedPrisonerLastName: string
}

// eslint-disable-next-line no-shadow
export const enum PlaceholderText {
  PRISONER_FULL_NAME = '{PRISONER_FULL_NAME}',
  ASSOCIATED_PRISONER_FULL_NAME = '{ASSOCIATED_PRISONER_FULL_NAME}',
}

export function getPlaceholderValues(prisoner: PrisonerResult, associatedPrisoner: PrisonerResult): PlaceholderValues {
  return {
    prisonerFirstName: properCaseName(prisoner.firstName),
    prisonerLastName: properCaseName(prisoner.lastName),
    associatedPrisonerFirstName: properCaseName(associatedPrisoner?.firstName),
    associatedPrisonerLastName: properCaseName(associatedPrisoner?.lastName),
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
}
