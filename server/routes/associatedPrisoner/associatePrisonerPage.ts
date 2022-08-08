/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './associatePrisonerValidation'
import { User } from '../../data/hmppsAuthClient'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import validatePrisonerSearch from '../util/incidentSearchValidation'
import { DraftAdjudicationResult } from '../../data/DraftAdjudicationResult'
import {
  AssociatedPrisonerLocation,
  getDraftIdFromString,
  extractAssociatedDetails,
  getPrisonerLocation,
  RoleAssociatedPrisoner,
  redirectToSearchForPersonPage,
  redirectToDeletePersonPage,
  renderData,
  DisplayData,
  redirectToOffenceSelection,
} from './associatePrisonerUtils'

export enum PageRequestType {
  EDIT,
  EDIT_SUBMITTED,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }
}

export default class AssociatePrisonerPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly placeOnReportService: PlaceOnReportService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = getDraftIdFromString(req.params.adjudicationNumber)
    const { roleCode } = req.params
    const fromDelete = req.query.personDeleted as string
    const fromSearch = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    let roleAssociatedPrisoner = await this.readFromApi(draftId, user as User)

    if (fromSearch) {
      roleAssociatedPrisoner = {
        prisonerNumber: roleAssociatedPrisoner.prisonerNumber,
        currentAssociatedPrisonerNumber: fromSearch,
      }
    } else if (fromDelete) {
      roleAssociatedPrisoner = {
        prisonerNumber: roleAssociatedPrisoner.prisonerNumber,
      }
    }
    const pageData = await this.getDisplayData(roleAssociatedPrisoner, user as User)

    renderData(res, draftId, roleCode, pageData, null)

    delete req.session.redirectUrl
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    if (req.body.deleteUser) {
      return this.delete(req, res)
    }
    if (req.body.searchUser) {
      return this.search(req, res)
    }
    return this.save(req, res)
  }

  save = async (req: Request, res: Response) => {
    const draftId = getDraftIdFromString(req.params.adjudicationNumber)
    const { roleCode } = req.params
    const { user } = res.locals

    const { prisonerNumber } = await this.readFromApi(draftId, user as User)

    const associatedPrisonersName =
      req.body.prisonerOutsideEstablishmentNameInput === '' ? null : req.body.prisonerOutsideEstablishmentNameInput
    const associatedPrisonersNumber =
      // eslint-disable-next-line no-nested-ternary
      req.body.prisonerId !== ''
        ? req.body.prisonerId
        : req.body.prisonerOutsideEstablishmentNumberInput === ''
        ? null
        : req.body.prisonerOutsideEstablishmentNumberInput

    const roleAssociatedPrisoner = {
      prisonerNumber,
      currentAssociatedPrisonerName: associatedPrisonersName,
      currentAssociatedPrisonerNumber: associatedPrisonersNumber,
    }

    const validationError = validateForm({
      location: getPrisonerLocation(roleAssociatedPrisoner),
      associatedPrisonersName,
      associatedPrisonersNumber,
    })
    if (validationError) {
      const pageData = await this.getDisplayData(roleAssociatedPrisoner, user as User)
      return renderData(res, draftId, roleCode, pageData, validationError)
    }

    try {
      await this.saveToApiUpdate(draftId, roleAssociatedPrisoner, user as User)

      return redirectToOffenceSelection(res, draftId, roleCode)
    } catch (postError) {
      this.setUpRedirectForEditError(res, draftId, roleCode)
      throw postError
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    return redirectToDeletePersonPage(res, req.body.prisonerId)
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const user = res.locals
    const draftId = getDraftIdFromString(req.params.adjudicationNumber)
    const { roleCode } = req.params

    if (this.pageOptions.isPreviouslySubmitted()) {
      const originalPageReferrerUrl = req.query.referrer as string
      req.session.redirectUrl = `${adjudicationUrls.incidentRole.urls.submittedEdit(draftId)}${
        originalPageReferrerUrl ? `?referrer=${originalPageReferrerUrl}` : ''
      }`
    } else {
      req.session.redirectUrl = adjudicationUrls.incidentAssociate.urls.start(draftId, roleCode)
    }

    const searchValidationError = validatePrisonerSearch({
      searchTerm: req.body.prisonerSearchNameInput,
    })
    if (searchValidationError) {
      const pageData = await this.getDisplayData(
        {
          prisonerNumber: req.body.prisonerSearchNameInput,
          currentAssociatedPrisonerNumber: req.body.prisonerSearchNameInput,
        },
        user as User
      )

      return renderData(res, draftId, roleCode, pageData, [searchValidationError])
    }
    return redirectToSearchForPersonPage(res, req.body.prisonerSearchNameInput)
  }

  readFromApi = async (draftId: number, user: User): Promise<RoleAssociatedPrisoner> => {
    return extractAssociatedDetails(await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user))
  }

  saveToApiUpdate = async (
    draftId: number,
    roleAssociatedPrisoner: RoleAssociatedPrisoner,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    return this.placeOnReportService.saveAssociatedPrisoner(
      draftId,
      {
        associatedPrisonersNumber: roleAssociatedPrisoner.currentAssociatedPrisonerNumber,
        associatedPrisonersName: roleAssociatedPrisoner.currentAssociatedPrisonerName,
      },
      currentUser
    )
  }

  getDisplayData = async (roleAssociatedPrisoner: RoleAssociatedPrisoner, currentUser: User): Promise<DisplayData> => {
    const prisoner = await this.placeOnReportService.getPrisonerDetails(
      roleAssociatedPrisoner.prisonerNumber,
      currentUser
    )
    const location = getPrisonerLocation(roleAssociatedPrisoner)
    let associatedPrisonersName

    switch (location) {
      case AssociatedPrisonerLocation.EXTERNAL:
        associatedPrisonersName = roleAssociatedPrisoner.currentAssociatedPrisonerName
        break
      case AssociatedPrisonerLocation.INTERNAL:
        associatedPrisonersName = roleAssociatedPrisoner.currentAssociatedPrisonerNumber
          ? await this.getCurrentAssociatedPrisonersName(
              roleAssociatedPrisoner.currentAssociatedPrisonerNumber,
              currentUser
            )
          : null
        break
      default:
    }

    return {
      prisoner,
      associatedPrisonersName,
      associatedPrisonerNumber: roleAssociatedPrisoner.currentAssociatedPrisonerNumber,
      location: location === AssociatedPrisonerLocation.UNKNOWN ? null : location,
    }
  }

  getCurrentAssociatedPrisonersName = async (associatedPrisonersNumber: string, user: User) => {
    if (!associatedPrisonersNumber) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.displayName
  }

  setUpRedirectForEditError = (res: Response, draftId: number, roleCode: string) => {
    res.locals.redirectUrl = this.pageOptions.isPreviouslySubmitted()
      ? adjudicationUrls.incidentAssociate.urls.submittedEdit(draftId, roleCode)
      : adjudicationUrls.incidentAssociate.urls.start(draftId, roleCode)
  }
}
