import { DraftAdjudicationResult } from '../../data/DraftAdjudicationResult'

export enum AssociatedPrisonerLocation {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  UNKNOWN = '',
}

export type RoleAssociatedPrisoner = {
  prisonerNumber: string
  currentAssociatedPrisonerNumber?: string
  currentAssociatedPrisonerName?: string
}

export const getDraftIdFromString = (draftId: string): number => {
  let draftIdValue: number = null
  if (draftId) {
    draftIdValue = parseInt(draftId, 10)
  }
  return draftIdValue
}

export const getPrisonerLocation = (roleAssociatedPrisoner: RoleAssociatedPrisoner): AssociatedPrisonerLocation => {
  if (
    roleAssociatedPrisoner.currentAssociatedPrisonerName == null &&
    roleAssociatedPrisoner.currentAssociatedPrisonerNumber == null
  ) {
    return AssociatedPrisonerLocation.UNKNOWN
  }
  return roleAssociatedPrisoner.currentAssociatedPrisonerName == null
    ? AssociatedPrisonerLocation.INTERNAL
    : AssociatedPrisonerLocation.EXTERNAL
}

export const extractAssociatedDetails = (draftAdjudicationResult: DraftAdjudicationResult): RoleAssociatedPrisoner => {
  return {
    prisonerNumber: draftAdjudicationResult.draftAdjudication.prisonerNumber,
    currentAssociatedPrisonerNumber: draftAdjudicationResult.draftAdjudication.incidentRole?.associatedPrisonersNumber,
    currentAssociatedPrisonerName: draftAdjudicationResult.draftAdjudication.incidentRole?.associatedPrisonersName,
  }
}
