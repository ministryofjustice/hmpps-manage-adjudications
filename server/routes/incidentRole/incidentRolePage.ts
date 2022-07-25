/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { debug } from 'console'
import validateForm from './incidentRoleValidation'
import validatePrisonerSearch from '../util/incidentSearchValidation'
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
  associatedPrisonersName?: string
}

type HiddenFormData = {
  originalIncidentRoleSelection: IncidentRole
  lastIncidentRoleSelection?: IncidentRole
  lastAssociatedPrisonerNumberSelection?: string
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
  searchForPersonRequest?: string
  deletePersonRequest?: string
}

type ExitButtonData = {
  prisonerNumber: string
  draftId: number
  prisonerReportUrl: string
}

type RequestValues = {
  draftId: number
  selectedPerson?: string
  deleteWanted?: string
  originalPageReferrerUrl?: string
}

type IncidentDetails = {
  prisonerNumber: string
  currentIncidentRoleSelection: IncidentRole
  currentAssociatedPrisonerNumber?: string
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
}

enum PageRequestAction {
  STANDARD,
  SEARCH_FOR_PRISONER,
  DELETE_PRISONER,
}

enum NextPageSelectionAfterEdit {
  OFFENCE_SELECTION,
  OFFENCE_DETAILS,
  TASK_LIST,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }
}

export default class IncidentRolePage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly placeOnReportService: PlaceOnReportService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const requestValues = extractValuesFromRequest(req)
    const requestData = getPageActionFromRequest(requestValues)
    const { user } = res.locals
    debugData('GET', requestValues)
    debugData('GET action', requestData)
    const draftIncidentDetails = await this.readFromApi(requestValues.draftId, user as User)

    let data: StashedIncidentDetails = null
    if (requestData !== PageRequestAction.STANDARD) {
      const sessionData = popDataFromSession(req, draftIncidentDetails.prisonerNumber)
      if (requestData === PageRequestAction.SEARCH_FOR_PRISONER) {
        data = updateDataOnSearchReturn(sessionData, requestValues)
      } else if (requestData === PageRequestAction.DELETE_PRISONER) {
        data = updateDataOnDeleteReturn(sessionData, requestValues)
      }
    } else {
      data = {
        incidentDetails: draftIncidentDetails,
        temporaryData: {
          originalIncidentRoleSelection: draftIncidentDetails.currentIncidentRoleSelection,
        },
      }
    }
    debugData('GET DATA', data)

    const pageData = await this.getPageDataOnGet(draftIncidentDetails.prisonerNumber, requestValues, data, user)
    renderData(res, pageData, null)

    // Only delete session data when the page is successfully shown.
    // This ensures the user can still see the data they entered in case of error.
    deleteSessionData(req)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const postValues = extractValuesFromPost(req)
    const postData = getPageActionFromPost(postValues)
    const { user } = res.locals
    const existingAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(
      postValues.draftId,
      user as User
    )

    const { offenceDetails, prisonerNumber } = existingAdjudication.draftAdjudication

    debugData('POST', postValues)
    debugData('POST action', postData)

    if (postData !== PageRequestAction.STANDARD) {
      const dataToSaveAfterRedirect = transformFormDataToStashedData(postValues)
      let returnUrl = null
      if (this.pageOptions.isPreviouslySubmitted()) {
        returnUrl = `${adjudicationUrls.incidentRole.urls.submittedEdit(postValues.draftId)}${
          postValues.originalPageReferrerUrl ? `?referrer=${postValues.originalPageReferrerUrl}` : ''
        }`
      } else {
        returnUrl = adjudicationUrls.incidentRole.urls.start(postValues.draftId)
      }
      stashDataOnSession(returnUrl, dataToSaveAfterRedirect, req)
      if (postData === PageRequestAction.DELETE_PRISONER) {
        return redirectToDeletePersonPage(res, postValues.incidentDetails.currentAssociatedPrisonerNumber)
      }
      if (postData === PageRequestAction.SEARCH_FOR_PRISONER) {
        const searchValidationError = validatePrisonerSearch({
          searchTerm: postValues.incidentDetails.currentAssociatedPrisonerNumber,
          inputId: postValues.incidentDetails.currentIncidentRoleSelection,
        })
        if (searchValidationError) {
          // Could stash to session and redirect here
          const pageData = await this.getPageDataOnPost(postValues, prisonerNumber, user)
          return renderData(res, pageData, searchValidationError)
        }
        return redirectToSearchForPersonPage(res, postValues.incidentDetails.currentAssociatedPrisonerNumber)
      }
    }

    const validationError = validateForm({
      incidentRole: postValues.incidentDetails?.currentIncidentRoleSelection,
      associatedPrisonersNumber: postValues.incidentDetails?.currentAssociatedPrisonerNumber,
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

      const offencesExist = !removeExistingOffences && offenceDetails?.length > 0
      if (!offencesExist) {
        return redirectToOffenceSelection(res, postValues.draftId, incidentDetailsToSave.currentIncidentRoleSelection)
      }
      return redirectToOffenceDetails(res, postValues.draftId)
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
      data.currentAssociatedPrisonerNumber,
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
    exitButtonData = {
      prisonerNumber,
      draftId: requestValues.draftId,
      prisonerReportUrl,
    }
    return {
      displayData: await this.getDisplayData(
        prisonerNumber,
        currentUser,
        data?.incidentDetails?.currentAssociatedPrisonerNumber
      ),
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
    exitButtonData = {
      prisonerNumber,
      draftId: postValues.draftId,
      prisonerReportUrl,
    }

    return {
      displayData: await this.getDisplayData(
        prisonerNumber,
        currentUser,
        postValues.incidentDetails?.currentAssociatedPrisonerNumber
      ),
      exitButtonData,
      formData: postValues,
    }
  }

  getDisplayData = async (
    prisonerNumber: string,
    currentUser: User,
    currentAssociatedPrisonerNumber?: string
  ): Promise<DisplayData> => {
    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, currentUser)

    const associatedPrisonersName = currentAssociatedPrisonerNumber
      ? await this.getCurrentAssociatedPrisonersName(currentAssociatedPrisonerNumber, currentUser)
      : null

    return {
      prisoner,
      associatedPrisonersName,
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
    res.locals.redirectUrl = this.pageOptions.isPreviouslySubmitted()
      ? adjudicationUrls.incidentRole.urls.submittedEdit(draftId)
      : adjudicationUrls.incidentRole.urls.start(draftId)
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

const getPageActionFromRequest = (reqData: RequestValues): PageRequestAction => {
  if (reqData.selectedPerson) {
    return PageRequestAction.SEARCH_FOR_PRISONER
  }
  if (reqData.deleteWanted) {
    return PageRequestAction.DELETE_PRISONER
  }
  return PageRequestAction.STANDARD
}

const popDataFromSession = (req: Request, prisonerNumber: string): StashedIncidentDetails => {
  const currentIncidentRoleSelection = incidentRoleFromCode(req.session.currentRadioSelection)
  const currentAssociatedPrisonerNumber = req.session.currentAssociatedPrisonersNumber
  const originalIncidentRoleSelection = incidentRoleFromCode(req.session.originalRadioSelection)
  return {
    incidentDetails: {
      prisonerNumber,
      currentIncidentRoleSelection,
      currentAssociatedPrisonerNumber,
    },
    temporaryData: {
      originalIncidentRoleSelection,
    },
  }
}

const deleteSessionData = (req: Request) => {
  delete req.session.redirectUrl
  delete req.session.currentRadioSelection
  delete req.session.currentAssociatedPrisonersNumber
  delete req.session.originalRadioSelection
}

const stashDataOnSession = (returnUrl: string, dataToStore: StashedIncidentDetails, req: Request) => {
  req.session.redirectUrl = returnUrl
  req.session.currentRadioSelection = codeFromIncidentRole(dataToStore.incidentDetails.currentIncidentRoleSelection)
  req.session.currentAssociatedPrisonersNumber = dataToStore.incidentDetails.currentAssociatedPrisonerNumber
  req.session.originalRadioSelection = codeFromIncidentRole(dataToStore.temporaryData.originalIncidentRoleSelection)
}

const extractIncidentDetails = (draftAdjudicationResult: DraftAdjudicationResult): IncidentDetails => {
  let incidentRoleCode: IncidentRole = null
  if (draftAdjudicationResult.draftAdjudication.incidentRole) {
    incidentRoleCode = incidentRoleFromCode(draftAdjudicationResult.draftAdjudication.incidentRole.roleCode)
  }
  return {
    prisonerNumber: draftAdjudicationResult.draftAdjudication.prisonerNumber,
    currentIncidentRoleSelection: incidentRoleCode,
    currentAssociatedPrisonerNumber: draftAdjudicationResult.draftAdjudication.incidentRole?.associatedPrisonersNumber,
  }
}

const transformFormDataToStashedData = (formData: SubmittedFormData): StashedIncidentDetails => {
  return {
    incidentDetails: formData.incidentDetails,
    temporaryData: {
      originalIncidentRoleSelection: formData.originalIncidentRoleSelection,
    },
  }
}

const transformStashedDataToFormData = (data: StashedIncidentDetails): InitialFormData => {
  return {
    incidentDetails: data?.incidentDetails,
    originalIncidentRoleSelection: data?.temporaryData?.originalIncidentRoleSelection,
    lastIncidentRoleSelection: data?.incidentDetails?.currentIncidentRoleSelection,
    lastAssociatedPrisonerNumberSelection: data?.incidentDetails?.currentAssociatedPrisonerNumber,
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

const getPageActionFromPost = (reqData: SubmittedFormData): PageRequestAction => {
  if (
    reqData.searchForPersonRequest === 'incitedSearchSubmit' ||
    reqData.searchForPersonRequest === 'assistedSearchSubmit'
  ) {
    return PageRequestAction.SEARCH_FOR_PRISONER
  }
  if (reqData.deletePersonRequest === 'incitedDelete' || reqData.deletePersonRequest === 'assistedDelete') {
    return PageRequestAction.DELETE_PRISONER
  }
  return PageRequestAction.STANDARD
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
  const currentAssociatedPrisonerNumber = pageData.formData.incidentDetails?.currentAssociatedPrisonerNumber
  let incitedInput = null
  let assistedInput = null
  if (currentIncidentRoleSelection && currentAssociatedPrisonerNumber) {
    if (currentIncidentRoleSelection === IncidentRole.ASSISTED) {
      assistedInput = currentAssociatedPrisonerNumber
    } else if (currentIncidentRoleSelection === IncidentRole.INCITED) {
      incitedInput = currentAssociatedPrisonerNumber
    }
  }
  const data = {
    originalRadioSelection: radioSelectionCodeFromIncidentRole(currentIncidentRoleSelection),
    associatedPrisonersNumber: pageData.formData.incidentDetails?.currentAssociatedPrisonerNumber,
    associatedPrisonersName: pageData.displayData.associatedPrisonersName,
  }
  return res.render(`pages/incidentRole`, {
    errors: error ? [error] : [],
    prisoner: pageData.displayData.prisoner,
    data,
    submitButtonText: 'Save and continue',
    exitButtonHref,
    incitedInput,
    assistedInput,
    originalIncidentRoleSelection: pageData.formData.originalIncidentRoleSelection,
    lastIncidentRoleSelection: pageData.formData.lastIncidentRoleSelection,
    lastAssociatedPrisonerNumberSelection: pageData.formData.lastAssociatedPrisonerNumberSelection,
  })
}

export const updateDataOnSearchReturn = (
  stashedData: StashedIncidentDetails,
  requestData: RequestValues
): StashedIncidentDetails => {
  if (!requestData.selectedPerson) {
    return stashedData
  }
  return {
    incidentDetails: {
      ...stashedData.incidentDetails,
      currentAssociatedPrisonerNumber: requestData.selectedPerson,
    },
    temporaryData: stashedData.temporaryData,
  }
}

export const updateDataOnDeleteReturn = (
  stashedData: StashedIncidentDetails,
  requestData: RequestValues
): StashedIncidentDetails => {
  if (!requestData.deleteWanted || requestData.deleteWanted !== 'true') {
    return stashedData
  }
  return {
    incidentDetails: {
      ...stashedData.incidentDetails,
      currentAssociatedPrisonerNumber: null,
    },
    temporaryData: stashedData.temporaryData,
  }
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

const redirectToSearchForPersonPage = (res: Response, searchTerm: string) => {
  return res.redirect(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=${searchTerm}`)
}

const redirectToDeletePersonPage = (res: Response, prisonerToDelete: string) => {
  return res.redirect(`${adjudicationUrls.deletePerson.root}?associatedPersonId=${prisonerToDelete}`)
}

const redirectToOffenceSelection = (res: Response, draftId: number, incidentRoleCode: IncidentRole) => {
  return res.redirect(
    adjudicationUrls.offenceCodeSelection.urls.start(draftId, radioSelectionCodeFromIncidentRole(incidentRoleCode))
  )
}

const redirectToOffenceDetails = (res: Response, draftId: number) => {
  return res.redirect(adjudicationUrls.detailsOfOffence.urls.start(draftId))
}

// TODO - How best to debug (if at all). We need some unoffical way of logging - do not invoke App Insights
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugData = (outputId: string, data: any) => {
  debug(outputId)
  debug(data)
}
