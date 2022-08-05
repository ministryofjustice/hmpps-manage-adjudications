import { Response } from 'express'
import { DraftAdjudicationResult } from '../../data/DraftAdjudicationResult'
import adjudicationUrls from '../../utils/urlGenerator'
import { FormError } from '../../@types/template'
import { PrisonerResultSummary } from '../../services/placeOnReportService'

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

export type DisplayData = {
  prisoner: PrisonerResultSummary
  associatedPrisonersName?: string
  associatedPrisonerNumber?: string
  location?: AssociatedPrisonerLocation
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

export const redirectToSearchForPersonPage = (res: Response, searchTerm: string) => {
  return res.redirect(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=${searchTerm}`)
}

export const redirectToDeletePersonPage = (res: Response, prisonerToDelete: string) => {
  return res.redirect(`${adjudicationUrls.deletePerson.root}?associatedPersonId=${prisonerToDelete}`)
}

export const renderData = (res: Response, page: string, draftId: number, pageData: DisplayData, error: FormError[]) => {
  return res.render(page, {
    errors: error || [],
    exitButtonHref: adjudicationUrls.taskList.urls.start(draftId),
    decisionData: {
      selectedAnswerId: pageData.location,
      selectedAnswerData: {
        otherPersonNameInput:
          pageData.location === AssociatedPrisonerLocation.EXTERNAL ? pageData.associatedPrisonersName : null,
        prisonerNumberInput:
          pageData.location === AssociatedPrisonerLocation.EXTERNAL ? pageData.associatedPrisonerNumber : null,
        prisonerId:
          pageData.location === AssociatedPrisonerLocation.INTERNAL ? pageData.associatedPrisonerNumber : null,
        prisonerSearchNameInput:
          pageData.location === AssociatedPrisonerLocation.INTERNAL ? pageData.associatedPrisonersName : null,
        prisonerName:
          pageData.location === AssociatedPrisonerLocation.INTERNAL ? pageData.associatedPrisonersName : null,
      },
    },
    viewData: {
      prisonerName: pageData.associatedPrisonersName,
    },
    prisoner: pageData.prisoner,
  })
}
