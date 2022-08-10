import { Response, Request } from 'express'
import { DraftAdjudicationResult } from '../../data/DraftAdjudicationResult'
import { IncidentRole } from '../../incidentRole/IncidentRole'
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

export const getAssociatedPrisonerLocation = (selectedAnswerId: string): AssociatedPrisonerLocation => {
  if (!selectedAnswerId) {
    return AssociatedPrisonerLocation.UNKNOWN
  }

  if (selectedAnswerId === 'internal') {
    return AssociatedPrisonerLocation.INTERNAL
  }

  return AssociatedPrisonerLocation.EXTERNAL
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

export const getAssociatedPrisonersName = (req: Request) => {
  return req.body.prisonerOutsideEstablishmentNameInput === '' ? null : req.body.prisonerOutsideEstablishmentNameInput
}

export const getAssociatedPrisonersNumber = (req: Request, selectedAnswerId: AssociatedPrisonerLocation) => {
  // eslint-disable-next-line no-nested-ternary
  return selectedAnswerId === AssociatedPrisonerLocation.INTERNAL
    ? req.body.prisonerId !== ''
      ? req.body.prisonerId
      : null
    : // eslint-disable-next-line no-nested-ternary
    selectedAnswerId === AssociatedPrisonerLocation.EXTERNAL
    ? req.body.prisonerOutsideEstablishmentNumberInput !== ''
      ? req.body.prisonerOutsideEstablishmentNumberInput
      : null
    : null
}

export const redirectToSearchForPersonPage = (res: Response, searchTerm: string) => {
  return res.redirect(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=${searchTerm}`)
}

export const redirectToDeletePersonPage = (res: Response, prisonerToDelete: string) => {
  return res.redirect(`${adjudicationUrls.deletePerson.root}?associatedPersonId=${prisonerToDelete}`)
}

export const redirectToOffenceSelection = (res: Response, draftId: number, incidentRoleCode: string) => {
  return res.redirect(
    adjudicationUrls.offenceCodeSelection.urls.start(
      draftId,
      radioSelectionCodeFromIncidentRole(IncidentRole[incidentRoleCode.toUpperCase()])
    )
  )
}

export const setRedirectUrl = (req: Request, draftId: number, roleCode: string, isPreviouslySubmitted: boolean) => {
  if (isPreviouslySubmitted) {
    const originalPageReferrerUrl = req.query.referrer as string
    req.session.redirectUrl = `${adjudicationUrls.incidentAssociate.urls.submittedEdit(draftId, roleCode)}${
      originalPageReferrerUrl ? `?referrer=${originalPageReferrerUrl}` : ''
    }`
  } else {
    req.session.redirectUrl = adjudicationUrls.incidentAssociate.urls.start(draftId, roleCode)
  }
}

export const renderData = (
  res: Response,
  draftId: number,
  roleCode: string,
  pageData: DisplayData,
  error: FormError[]
) => {
  return res.render(`pages/associatePrisoner`, {
    roleCode: roleCode === 'assisted' ? 'assist' : 'incite',
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

const radioSelectionCodeFromIncidentRole = (incidentRole: IncidentRole): string => {
  if (!incidentRole) {
    return null
  }
  let radioSelectionCode = null
  switch (incidentRole) {
    case IncidentRole.COMMITTED:
      radioSelectionCode = 'committed'
      break
    case IncidentRole.ATTEMPTED:
      radioSelectionCode = 'attempted'
      break
    case IncidentRole.INCITED:
      radioSelectionCode = 'incited'
      break
    case IncidentRole.ASSISTED:
    // Fall through
    default:
      radioSelectionCode = 'assisted'
      break
  }
  return radioSelectionCode
}
