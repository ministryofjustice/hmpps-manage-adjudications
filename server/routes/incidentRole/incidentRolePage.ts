/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './incidentRoleValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import logger from '../../../logger'
import { User } from '../../data/hmppsAuthClient'
import { codeFromIncidentRole, IncidentRole, incidentRoleFromCode } from '../../incidentRole/IncidentRole'
import { DraftAdjudicationResult } from '../../data/DraftAdjudicationResult'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  displayData: DisplayData
  formData?: InitialFormData
  exitButtonData?: ExitButtonData
  error?: FormError | FormError[]
}

type DisplayData = {
  prisoner: PrisonerResultSummary
}

type HiddenFormData = {
  originalIncidentRoleSelection: IncidentRole
  lastIncidentRoleSelection?: IncidentRole
}

type InitialFormData = HiddenFormData & {
  incidentDetails?: IncidentDetails
}

type SubmittedFormData = HiddenFormData & {
  // From URL
  draftId?: number
  originalPageReferrerUrl?: string
  // Input data
  incidentDetails: IncidentDetails
}

type ExitButtonData = {
  prisonerNumber: string
  draftId: number
  prisonerReportUrl: string
}

type RequestValues = {
  draftId: number
  originalPageReferrerUrl?: string
}

type IncidentDetails = {
  prisonerNumber: string
  currentIncidentRoleSelection: IncidentRole
}

type TemporarilySavedData = {
  originalIncidentRoleSelection: IncidentRole
}

type StashedIncidentDetails = {
  incidentDetails: IncidentDetails
  temporaryData?: TemporarilySavedData
}

export enum PageRequestType {
  EDIT,
  EDIT_SUBMITTED,
  EDIT_SUBMITTED_ALO,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }

  isAloEdit(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED_ALO
  }
}

export default class IncidentRolePage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly placeOnReportService: PlaceOnReportService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const requestValues = extractValuesFromRequest(req)
    const { user } = res.locals
    const draftIncidentDetails = await this.readFromApi(requestValues.draftId, user as User)

    const data: StashedIncidentDetails = {
      incidentDetails: draftIncidentDetails,
      temporaryData: {
        originalIncidentRoleSelection: draftIncidentDetails.currentIncidentRoleSelection,
      },
    }

    const pageData = await this.getPageDataOnGet(draftIncidentDetails.prisonerNumber, requestValues, data, user)
    renderData(res, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const postValues = extractValuesFromPost(req)
    const { user } = res.locals
    const existingAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(
      postValues.draftId,
      user as User
    )

    const { offenceDetails, prisonerNumber } = existingAdjudication.draftAdjudication
    const validationError = validateForm({
      incidentRole: postValues.incidentDetails?.currentIncidentRoleSelection,
    })
    if (validationError) {
      // Could stash to session and redirect here
      const pageData = await this.getPageDataOnPost(postValues, prisonerNumber, user)
      return renderData(res, pageData, validationError)
    }

    const incidentDetailsToSave = postValues.incidentDetails

    try {
      const incidentRoleChanged =
        postValues.originalIncidentRoleSelection !== incidentDetailsToSave.currentIncidentRoleSelection
      const removeExistingOffences = incidentRoleChanged
      await this.saveToApiUpdate(postValues.draftId, incidentDetailsToSave, removeExistingOffences, user as User)
      if ([IncidentRole.ASSISTED, IncidentRole.INCITED].includes(incidentDetailsToSave.currentIncidentRoleSelection)) {
        return redirectToAssociatedPrisoner(
          res,
          postValues.draftId,
          incidentDetailsToSave.currentIncidentRoleSelection,
          this.pageOptions.isPreviouslySubmitted()
        )
      }
      const offencesExist = !removeExistingOffences && offenceDetails && Object.keys(offenceDetails).length > 0
      if (!!req.session.forceOffenceSelection || !offencesExist) {
        return redirectToOffenceSelection(
          res,
          postValues.draftId,
          incidentDetailsToSave.currentIncidentRoleSelection,
          this.pageOptions
        )
      }
      return redirectToOffenceDetails(res, postValues.draftId, this.pageOptions)
    } catch (postError) {
      this.setUpRedirectForEditError(res, postError, postValues.draftId)
      throw postError
    }
  }

  readFromApi = async (draftId: number, user: User): Promise<IncidentDetails> => {
    return extractIncidentDetails(await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user))
  }

  saveToApiUpdate = async (
    draftId: number,
    data: IncidentDetails,
    removeExistingOffences: boolean,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    // eslint-disable-next-line no-return-await
    return this.placeOnReportService.updateDraftIncidentRole(
      draftId,
      codeFromIncidentRole(data.currentIncidentRoleSelection),
      removeExistingOffences,
      currentUser
    )
  }

  getPageDataOnGet = async (
    prisonerNumber: string,
    requestValues: RequestValues,
    data: StashedIncidentDetails,
    currentUser: User
  ): Promise<PageData> => {
    let exitButtonData: ExitButtonData = null
    let prisonerReportUrl = null
    if (this.pageOptions.isPreviouslySubmitted()) {
      prisonerReportUrl = requestValues.originalPageReferrerUrl
    }
    if (this.pageOptions.isAloEdit()) {
      prisonerReportUrl = adjudicationUrls.prisonerReport.urls.review(requestValues.draftId)
    }
    exitButtonData = {
      prisonerNumber,
      draftId: requestValues.draftId,
      prisonerReportUrl,
    }
    return {
      displayData: await this.getDisplayData(prisonerNumber, currentUser),
      exitButtonData,
      formData: transformStashedDataToFormData(data),
    }
  }

  getPageDataOnPost = async (
    postValues: SubmittedFormData,
    prisonerNumber: string,
    currentUser: User
  ): Promise<PageData> => {
    let exitButtonData: ExitButtonData = null
    let prisonerReportUrl = null
    if (this.pageOptions.isPreviouslySubmitted()) {
      prisonerReportUrl = postValues.originalPageReferrerUrl
    }
    if (this.pageOptions.isAloEdit()) {
      prisonerReportUrl = adjudicationUrls.prisonerReport.urls.review(postValues.draftId)
    }
    exitButtonData = {
      prisonerNumber,
      draftId: postValues.draftId,
      prisonerReportUrl,
    }

    return {
      displayData: await this.getDisplayData(prisonerNumber, currentUser),
      exitButtonData,
      formData: postValues,
    }
  }

  getDisplayData = async (prisonerNumber: string, currentUser: User): Promise<DisplayData> => {
    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, currentUser)
    return {
      prisoner,
    }
  }

  getCurrentAssociatedPrisonersName = async (associatedPrisonersNumber: string, user: User) => {
    if (!associatedPrisonersNumber) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.displayName
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpRedirectForEditError = (res: Response, error: any, draftId: number) => {
    logger.error(`Failed to post edited incident details for draft adjudication: ${error}`)
    if (this.pageOptions.isPreviouslySubmitted()) {
      adjudicationUrls.incidentRole.urls.submittedEdit(draftId)
    } else if (this.pageOptions.isAloEdit()) {
      adjudicationUrls.incidentRole.urls.aloSubmittedEdit(draftId)
    } else {
      adjudicationUrls.incidentRole.urls.start(draftId)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpRedirectForCreationError = (res: Response, draftId: number, error: any) => {
    logger.error(`Failed to post incident details for draft adjudication: ${error}`)
    res.locals.redirectUrl = adjudicationUrls.incidentRole.urls.start(draftId)
  }
}

const extractValuesFromRequest = (req: Request): RequestValues => {
  const values = {
    draftId: getDraftIdFromString(req.params.adjudicationNumber),
    selectedPerson: JSON.stringify(req.query.selectedPerson)?.replace(/"/g, ''),
    deleteWanted: req.query.personDeleted as string,
    originalPageReferrerUrl: req.query.referrer as string,
  }
  return values
}

const extractIncidentDetails = (draftAdjudicationResult: DraftAdjudicationResult): IncidentDetails => {
  let incidentRoleCode: IncidentRole = null
  if (draftAdjudicationResult.draftAdjudication.incidentRole) {
    incidentRoleCode = incidentRoleFromCode(draftAdjudicationResult.draftAdjudication.incidentRole.roleCode)
  }
  return {
    prisonerNumber: draftAdjudicationResult.draftAdjudication.prisonerNumber,
    currentIncidentRoleSelection: incidentRoleCode,
  }
}

const transformStashedDataToFormData = (data: StashedIncidentDetails): InitialFormData => {
  return {
    incidentDetails: data?.incidentDetails,
    originalIncidentRoleSelection: data?.temporaryData?.originalIncidentRoleSelection,
    lastIncidentRoleSelection: data?.incidentDetails?.currentIncidentRoleSelection,
  }
}

const extractValuesFromPost = (req: Request): SubmittedFormData => {
  const currentIncidentRoleSelection = incidentRoleFromRadioSelection(req.body.currentRadioSelected)
  const previousIncidentRoleSelection = incidentRoleFromRadioSelection(req.body.lastIncidentRoleSelection)
  let currentAssociatedPrisonerNumber = null
  if (previousIncidentRoleSelection !== currentIncidentRoleSelection) {
    if (currentIncidentRoleSelection === IncidentRole.ASSISTED) {
      currentAssociatedPrisonerNumber = req.body.assistedInput
    } else if (currentIncidentRoleSelection === IncidentRole.INCITED) {
      currentAssociatedPrisonerNumber = req.body.incitedInput
    }
  } else {
    currentAssociatedPrisonerNumber = req.body.lastAssociatedPrisonerNumberSelection
  }
  const values = {
    prisonerNumber: req.body.prisonerNumber,
    draftId: getDraftIdFromString(req.params.adjudicationNumber),
    searchForPersonRequest: req.body.search,
    deletePersonRequest: req.body.deleteAssociatedPrisoner,
    incidentDetails: {
      prisonerNumber: req.params.prisonerNumber,
      currentIncidentRoleSelection,
      currentAssociatedPrisonerNumber,
    },
    originalIncidentRoleSelection: incidentRoleFromRadioSelection(req.body.originalIncidentRoleSelection),
    originalPageReferrerUrl: req.query.referrer as string,
  }
  return values
}

const renderData = (res: Response, pageData: PageData, error: FormError) => {
  let exitButtonHref = null
  if (pageData.exitButtonData) {
    if (pageData.exitButtonData.prisonerReportUrl) {
      exitButtonHref = pageData.exitButtonData.prisonerReportUrl
    } else {
      exitButtonHref = getTaskListUrl(pageData.exitButtonData.draftId)
    }
  }
  const currentIncidentRoleSelection = pageData.formData.incidentDetails?.currentIncidentRoleSelection

  const data = {
    originalRadioSelection: radioSelectionCodeFromIncidentRole(currentIncidentRoleSelection),
  }
  return res.render(`pages/incidentRole`, {
    errors: error ? [error] : [],
    prisoner: pageData.displayData.prisoner,
    data,
    submitButtonText: 'Save and continue',
    exitButtonHref,
    originalIncidentRoleSelection: pageData.formData.originalIncidentRoleSelection,
    lastIncidentRoleSelection: pageData.formData.lastIncidentRoleSelection,
  })
}

const getDraftIdFromString = (draftId: string): number => {
  let draftIdValue: number = null
  if (draftId) {
    draftIdValue = parseInt(draftId, 10)
  }
  return draftIdValue
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

const incidentRoleFromRadioSelection = (radioSelectionCode: string): IncidentRole => {
  if (!radioSelectionCode) {
    return null
  }
  if (radioSelectionCode === 'attempted') {
    return IncidentRole.ATTEMPTED
  }
  if (radioSelectionCode === 'incited') {
    return IncidentRole.INCITED
  }
  if (radioSelectionCode === 'assisted') {
    return IncidentRole.ASSISTED
  }
  return IncidentRole.COMMITTED
}

const getTaskListUrl = (draftId: number) => {
  return adjudicationUrls.taskList.urls.start(draftId)
}

const redirectToOffenceSelection = (
  res: Response,
  draftId: number,
  incidentRoleCode: IncidentRole,
  pageOptions: PageOptions
) => {
  if (pageOptions.isAloEdit()) {
    return res.redirect(
      adjudicationUrls.offenceCodeSelection.urls.aloEditStart(
        draftId,
        radioSelectionCodeFromIncidentRole(incidentRoleCode)
      )
    )
  }
  return res.redirect(
    adjudicationUrls.offenceCodeSelection.urls.start(draftId, radioSelectionCodeFromIncidentRole(incidentRoleCode))
  )
}

const redirectToOffenceDetails = (res: Response, draftId: number, pageOptions: PageOptions) => {
  if (pageOptions.isAloEdit()) return res.redirect(adjudicationUrls.detailsOfOffence.urls.aloEdit(draftId))
  return res.redirect(adjudicationUrls.detailsOfOffence.urls.start(draftId))
}

const redirectToAssociatedPrisoner = (res: Response, draftId: number, roleCode: string, isSubmitted: boolean) => {
  return isSubmitted
    ? res.redirect(adjudicationUrls.incidentAssociate.urls.submittedEdit(draftId, roleCode))
    : res.redirect(adjudicationUrls.incidentAssociate.urls.start(draftId, roleCode))
}
