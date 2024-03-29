/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm, { errors } from './associatedPrisonerValidation'
import { User } from '../../data/hmppsManageUsersClient'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
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
  setRedirectUrl,
  getAssociatedPrisonersNumber,
  getAssociatedPrisonersName,
  getAssociatedPrisonerLocation,
} from './associatedPrisonerUtils'
import PrisonerSearchService from '../../services/prisonerSearchService'

export enum PageRequestType {
  EDIT,
  EDIT_SUBMITTED,
  ALO_EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }

  isAloEdit(): boolean {
    return this.pageType === PageRequestType.ALO_EDIT
  }
}

export default class AssociatedPrisonerPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly prisonerSearchService: PrisonerSearchService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = getDraftIdFromString(req.params.draftId)
    const { roleCode } = req.params
    const fromDelete = req.query.personDeleted as string
    const fromSearch = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const roleAssociatedPrisoner = await this.readFromApi(draftId, user as User)

    if (fromSearch) {
      roleAssociatedPrisoner.currentAssociatedPrisonerNumber = fromSearch
      roleAssociatedPrisoner.currentAssociatedPrisonerName = null
    } else if (fromDelete) {
      roleAssociatedPrisoner.currentAssociatedPrisonerNumber = null
      roleAssociatedPrisoner.currentAssociatedPrisonerName = null
    }
    const pageData = await this.getDisplayData(roleAssociatedPrisoner, null, user as User)

    if (fromDelete) {
      pageData.location = AssociatedPrisonerLocation.INTERNAL
    }

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
    const draftId = getDraftIdFromString(req.params.draftId)
    const { roleCode } = req.params
    const { user } = res.locals
    const { selectedAnswerId } = req.body

    const { prisonerNumber } = await this.readFromApi(draftId, user as User)

    const associatedPrisonersName =
      selectedAnswerId === AssociatedPrisonerLocation.EXTERNAL ? getAssociatedPrisonersName(req) : null
    const associatedPrisonersNumber = getAssociatedPrisonersNumber(req, selectedAnswerId)

    const roleAssociatedPrisoner = {
      prisonerNumber,
      currentAssociatedPrisonerName: associatedPrisonersName,
      currentAssociatedPrisonerNumber: associatedPrisonersNumber,
    }

    const validationError = validateForm({
      location: getAssociatedPrisonerLocation(selectedAnswerId),
      associatedPrisonersName,
      associatedPrisonersNumber,
    })
    if (validationError) {
      const pageData = await this.getDisplayData(roleAssociatedPrisoner, selectedAnswerId, user as User)
      return renderData(res, draftId, roleCode, pageData, validationError)
    }
    if (selectedAnswerId === AssociatedPrisonerLocation.EXTERNAL) {
      const foundPrisoner = await this.prisonerSearchService.isPrisonerNumberValid(associatedPrisonersNumber, user)

      if (!foundPrisoner) {
        const pageData = await this.getDisplayData(roleAssociatedPrisoner, selectedAnswerId, user as User)
        return renderData(res, draftId, roleCode, pageData, [errors.PRISONER_OUTSIDE_ESTABLISHMENT_INVALID_NUMBER])
      }
    }

    try {
      await this.saveToApiUpdate(draftId, roleAssociatedPrisoner, user as User)
      return redirectToOffenceSelection(res, draftId, roleCode, this.pageOptions.isAloEdit())
    } catch (postError) {
      this.setUpRedirectForEditError(res, draftId, roleCode)
      throw postError
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    const draftId = getDraftIdFromString(req.params.draftId)
    const { roleCode } = req.params

    setRedirectUrl(req, draftId, roleCode, this.pageOptions.isPreviouslySubmitted(), this.pageOptions.isAloEdit())

    return redirectToDeletePersonPage(res, req.body.prisonerId)
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = getDraftIdFromString(req.params.draftId)
    const { roleCode } = req.params
    const { selectedAnswerId } = req.body
    const { prisonerNumber } = await this.readFromApi(draftId, user as User)

    setRedirectUrl(req, draftId, roleCode, this.pageOptions.isPreviouslySubmitted(), this.pageOptions.isAloEdit())

    if (!req.body.prisonerSearchNameInput || req.body.prisonerSearchNameInput === '') {
      const pageData = await this.getDisplayData(
        {
          prisonerNumber,
          currentAssociatedPrisonerNumber: null,
          currentAssociatedPrisonerName: null,
        },
        selectedAnswerId,
        user as User
      )

      return renderData(res, draftId, roleCode, pageData, [errors.MISSING_INTERNAL_ASSOCIATED_PRISONER_ASSIST])
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

  getDisplayData = async (
    roleAssociatedPrisoner: RoleAssociatedPrisoner,
    locationOverride: AssociatedPrisonerLocation,
    currentUser: User
  ): Promise<DisplayData> => {
    const prisoner = await this.placeOnReportService.getPrisonerDetails(
      roleAssociatedPrisoner.prisonerNumber,
      currentUser
    )
    const location = locationOverride == null ? getPrisonerLocation(roleAssociatedPrisoner) : locationOverride
    const currentAssociatedPrisonerName = await this.getAssociatedPrisonerNameByLocation(
      location,
      roleAssociatedPrisoner,
      currentUser
    )

    return {
      prisoner,
      associatedPrisonersName: currentAssociatedPrisonerName,
      associatedPrisonerNumber: roleAssociatedPrisoner.currentAssociatedPrisonerNumber,
      location: location === AssociatedPrisonerLocation.UNKNOWN ? null : location,
    }
  }

  getAssociatedPrisonerNameByLocation = async (
    location: AssociatedPrisonerLocation,
    roleAssociatedPrisoner: RoleAssociatedPrisoner,
    currentUser: User
  ) => {
    switch (location) {
      case AssociatedPrisonerLocation.EXTERNAL:
        return roleAssociatedPrisoner.currentAssociatedPrisonerName

      case AssociatedPrisonerLocation.INTERNAL:
        return roleAssociatedPrisoner.currentAssociatedPrisonerNumber
          ? this.getCurrentAssociatedPrisonersName(roleAssociatedPrisoner.currentAssociatedPrisonerNumber, currentUser)
          : null

      default:
        return null
    }
  }

  getCurrentAssociatedPrisonersName = async (associatedPrisonersNumber: string, user: User) => {
    if (!associatedPrisonersNumber) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.displayName
  }

  setUpRedirectForEditError = (res: Response, draftId: number, roleCode: string) => {
    if (this.pageOptions.isAloEdit()) {
      res.locals.redirectUrl = adjudicationUrls.incidentAssociate.urls.aloEdit(draftId, roleCode)
    } else if (this.pageOptions.isPreviouslySubmitted()) {
      res.locals.redirectUrl = adjudicationUrls.incidentAssociate.urls.submittedEdit(draftId, roleCode)
    } else {
      res.locals.redirectUrl = adjudicationUrls.incidentAssociate.urls.start(draftId, roleCode)
    }
  }
}
