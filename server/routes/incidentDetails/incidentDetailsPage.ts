/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { debug } from 'console'
import validateForm from './incidentDetailsValidation'
import validatePrisonerSearch from './incidentDetailsSearchValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService, {
  ExistingDraftIncidentDetails,
  PrisonerResultSummary,
} from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'
import { User } from '../../data/hmppsAuthClient'
import { codeFromIncidentRole, IncidentRole, incidentRoleFromCode } from '../../incidentRole/IncidentRole'
import { PrisonLocation } from '../../data/PrisonLocationResult'
import { DraftAdjudicationResult } from '../../data/DraftAdjudicationResult'

type PageData = {
  displayData: DisplayData
  formData?: InitialFormData
  exitButtonData?: ExitButtonData
  error?: FormError | FormError[]
}

type DisplayData = {
  reporter: string
  prisoner: PrisonerResultSummary
  possibleLocations: PrisonLocation[]
  associatedPrisonersName?: string
}

type HiddenFormData = {
  originalIncidentRoleSelection: IncidentRole
  lastIncidentRoleSelection?: IncidentRole
  lastAssociatedPrisonerNumberSelection?: string
  originalReporterUsername: string
}

type InitialFormData = HiddenFormData & {
  incidentDetails?: IncidentDetails
}

type SubmittedFormData = HiddenFormData & {
  // From URL
  prisonerNumber: string
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
  // This PRN/DraftID stuff is duplicated a lot - extract?
  prisonerNumber: string
  draftId?: number
  selectedPerson?: string
  deleteWanted?: string
  originalPageReferrerUrl?: string
}

type IncidentDetails = {
  incidentDate: SubmittedDateTime
  locationId: number
  currentIncidentRoleSelection: IncidentRole
  currentAssociatedPrisonerNumber?: string
}

type TemporarilySavedData = {
  originalIncidentRoleSelection: IncidentRole
  originalReporterUsername: string
}

type StashedIncidentDetails = {
  incidentDetails: IncidentDetails
  temporaryData?: TemporarilySavedData
}

type ApiIncidentDetails = IncidentDetails & {
  reporterUsername: string
}

export enum PageRequestType {
  CREATION,
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
  CHECK_YOUR_ANSWERS,
  TASK_LIST,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT || this.pageType === PageRequestType.EDIT_SUBMITTED
  }

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }
}

export default class IncidentDetailsPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const requestValues = extractValuesFromRequest(req)
    const requestData = getPageActionFromRequest(requestValues)
    const { user } = res.locals
    debugData('GET', requestValues)
    debugData('GET action', requestData)

    let data: StashedIncidentDetails = null
    if (requestData !== PageRequestAction.STANDARD) {
      const sessionData = popDataFromSession(req)
      if (requestData === PageRequestAction.SEARCH_FOR_PRISONER) {
        data = updateDataOnSearchReturn(sessionData, requestValues)
      } else if (requestData === PageRequestAction.DELETE_PRISONER) {
        data = updateDataOnDeleteReturn(sessionData, requestValues)
      }
    } else if (this.pageOptions.isEdit()) {
      const draftIncidentDetails = await this.readFromApi(requestValues.draftId, user as User)
      data = {
        incidentDetails: draftIncidentDetails,
        temporaryData: {
          originalIncidentRoleSelection: draftIncidentDetails.currentIncidentRoleSelection,
          originalReporterUsername: draftIncidentDetails.reporterUsername,
        },
      }
    }
    debugData('GET DATA', data)

    let originalReporterUsernameForPage = user.username
    if (this.pageOptions.isEdit()) {
      originalReporterUsernameForPage = data.temporaryData?.originalReporterUsername
    }
    const pageData = await this.getPageDataOnGet(requestValues, originalReporterUsernameForPage, data, user)
    renderData(res, pageData, null)

    // Only delete session data when the page is successfully shown.
    // This ensures the user can still see the data they entered in case of error.
    deleteSessionData(req)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const postValues = extractValuesFromPost(req)
    const postData = getPageActionFromPost(postValues)
    const { user } = res.locals
    debugData('POST', postValues)
    debugData('POST action', postData)

    if (postData !== PageRequestAction.STANDARD) {
      const dataToSaveAfterRedirect = transformFormDataToStashedData(postValues)
      let returnUrl = null
      if (this.pageOptions.isEdit()) {
        if (this.pageOptions.isPreviouslySubmitted()) {
          returnUrl = `/incident-details/${postValues.prisonerNumber}/${postValues.draftId}/submitted/edit${
            postValues.originalPageReferrerUrl ? `?referrer=${postValues.originalPageReferrerUrl}` : ''
          }`
        } else {
          returnUrl = `/incident-details/${postValues.prisonerNumber}/${postValues.draftId}/edit`
        }
      } else {
        returnUrl = `/incident-details/${postValues.prisonerNumber}`
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
          const pageData = await this.getPageDataOnPost(postValues, user)
          return renderData(res, pageData, searchValidationError)
        }
        return redirectToSearchForPersonPage(res, postValues.incidentDetails.currentAssociatedPrisonerNumber)
      }
    }

    const validationError = validateForm({
      incidentDate: postValues.incidentDetails?.incidentDate,
      locationId: postValues.incidentDetails?.locationId,
      incidentRole: postValues.incidentDetails?.currentIncidentRoleSelection,
      associatedPrisonersNumber: postValues.incidentDetails?.currentAssociatedPrisonerNumber,
    })
    if (validationError) {
      // Could stash to session and redirect here
      const pageData = await this.getPageDataOnPost(postValues, user)
      return renderData(res, pageData, validationError)
    }

    const incidentDetailsToSave = postValues.incidentDetails

    try {
      if (this.pageOptions.isEdit()) {
        const incidentRoleChanged =
          postValues.originalIncidentRoleSelection !== incidentDetailsToSave.currentIncidentRoleSelection
        const removeExistingOffences = incidentRoleChanged
        await this.saveToApiUpdate(postValues.draftId, incidentDetailsToSave, removeExistingOffences, user as User)

        let defaultNextPage = NextPageSelectionAfterEdit.TASK_LIST
        if (this.pageOptions.isPreviouslySubmitted()) {
          defaultNextPage = NextPageSelectionAfterEdit.CHECK_YOUR_ANSWERS
        }
        const nextPageChoice = chooseNextPageAfterEdit(defaultNextPage, incidentRoleChanged)
        switch (nextPageChoice) {
          case NextPageSelectionAfterEdit.OFFENCE_SELECTION:
            return redirectToOffenceSelection(
              res,
              postValues.draftId,
              incidentDetailsToSave.currentIncidentRoleSelection
            )
          case NextPageSelectionAfterEdit.CHECK_YOUR_ANSWERS:
            // eslint-disable-next-line no-case-declarations
            const isReviewerPage = isReviewer(postValues.originalPageReferrerUrl)
            return redirectToCheckYourAnswers(res, postValues.prisonerNumber, postValues.draftId, isReviewerPage)
          default:
          // Fall through
        }
        return redirectToTaskList(res, postValues.draftId)
      }
      const newDraftData = await this.saveToApiNew(postValues.prisonerNumber, incidentDetailsToSave, user as User)
      return redirectToOffenceSelection(
        res,
        newDraftData.draftAdjudication.id,
        incidentDetailsToSave.currentIncidentRoleSelection
      )
    } catch (postError) {
      if (this.pageOptions.isEdit()) {
        this.setUpRedirectForEditError(res, postValues.prisonerNumber, postError, postValues.draftId)
      } else {
        this.setUpRedirectForCreationError(res, postValues.prisonerNumber, postValues.draftId, postError)
      }
      throw postError
    }
  }

  readFromApi = async (draftId: number, user: User): Promise<ApiIncidentDetails> => {
    return extractIncidentDetails(await this.placeOnReportService.getDraftIncidentDetailsForEditing(draftId, user))
  }

  saveToApiNew = async (
    prisonerNumber: string,
    data: IncidentDetails,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    // eslint-disable-next-line no-return-await
    return await this.placeOnReportService.startNewDraftAdjudication(
      formatDate(data.incidentDate),
      data.locationId,
      prisonerNumber,
      data.currentAssociatedPrisonerNumber,
      codeFromIncidentRole(data.currentIncidentRoleSelection),
      currentUser
    )
  }

  saveToApiUpdate = async (
    draftId: number,
    data: IncidentDetails,
    removeExistingOffences: boolean,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    // eslint-disable-next-line no-return-await
    return await this.placeOnReportService.editDraftIncidentDetails(
      draftId,
      formatDate(data.incidentDate),
      data.locationId,
      data.currentAssociatedPrisonerNumber,
      codeFromIncidentRole(data.currentIncidentRoleSelection),
      removeExistingOffences,
      currentUser
    )
  }

  getPageDataOnGet = async (
    requestValues: RequestValues,
    originalReporterUsername: string,
    data: StashedIncidentDetails,
    currentUser: User
  ): Promise<PageData> => {
    let exitButtonData: ExitButtonData = null
    if (this.pageOptions.isEdit()) {
      let prisonerReportUrl = null
      if (this.pageOptions.isPreviouslySubmitted()) {
        prisonerReportUrl = requestValues.originalPageReferrerUrl
      }
      exitButtonData = {
        prisonerNumber: requestValues.prisonerNumber,
        draftId: requestValues.draftId,
        prisonerReportUrl,
      }
    }
    return {
      displayData: await this.getDisplayData(
        requestValues.prisonerNumber,
        originalReporterUsername,
        currentUser,
        data?.incidentDetails?.currentAssociatedPrisonerNumber
      ),
      exitButtonData,
      formData: transformStashedDataToFormData(data, originalReporterUsername),
    }
  }

  getPageDataOnPost = async (postValues: SubmittedFormData, currentUser: User): Promise<PageData> => {
    let exitButtonData: ExitButtonData = null
    if (this.pageOptions.isEdit()) {
      let prisonerReportUrl = null
      if (this.pageOptions.isPreviouslySubmitted()) {
        prisonerReportUrl = postValues.originalPageReferrerUrl
      }
      exitButtonData = {
        prisonerNumber: postValues.prisonerNumber,
        draftId: postValues.draftId,
        prisonerReportUrl,
      }
    }
    return {
      displayData: await this.getDisplayData(
        postValues.prisonerNumber,
        postValues.originalReporterUsername,
        currentUser,
        postValues.incidentDetails?.currentAssociatedPrisonerNumber
      ),
      exitButtonData,
      formData: postValues,
    }
  }

  getDisplayData = async (
    prisonerNumber: string,
    originalReporterUsername: string,
    currentUser: User,
    currentAssociatedPrisonerNumber?: string
  ): Promise<DisplayData> => {
    const [prisoner, reporter] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, currentUser),
      this.placeOnReportService.getReporterName(originalReporterUsername, currentUser),
    ])
    const { agencyId } = prisoner.assignedLivingUnit
    const possibleLocations = await this.locationService.getIncidentLocations(agencyId, currentUser)

    const associatedPrisonersName = currentAssociatedPrisonerNumber
      ? await this.getCurrentAssociatedPrisonersName(currentAssociatedPrisonerNumber, currentUser)
      : null

    return {
      reporter,
      prisoner,
      possibleLocations,
      associatedPrisonersName,
    }
  }

  getCurrentAssociatedPrisonersName = async (associatedPrisonersNumber: string, user: User) => {
    if (!associatedPrisonersNumber) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.displayName
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpRedirectForEditError = (res: Response, prisonerNumber: string, error: any, draftId: number) => {
    logger.error(`Failed to post edited incident details for draft adjudication: ${error}`)
    res.locals.redirectUrl = this.pageOptions.isPreviouslySubmitted()
      ? `/incident-details/${prisonerNumber}/${draftId}/submitted/edit`
      : `/incident-details/${prisonerNumber}/${draftId}/edit`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpRedirectForCreationError = (res: Response, prisonerNumber: string, draftId: number, error: any) => {
    logger.error(`Failed to post incident details for draft adjudication: ${error}`)
    res.locals.redirectUrl = `/incident-details/${prisonerNumber}`
  }
}

const extractValuesFromRequest = (req: Request): RequestValues => {
  const values = {
    draftId: getDraftIdFromString(req.params.id),
    prisonerNumber: req.params.prisonerNumber,
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

const popDataFromSession = (req: Request): StashedIncidentDetails => {
  const { incidentDate } = req.session
  const locationId = req.session.incidentLocation
  const currentIncidentRoleSelection = incidentRoleFromCode(req.session.currentRadioSelection)
  const currentAssociatedPrisonerNumber = req.session.currentAssociatedPrisonersNumber
  const originalIncidentRoleSelection = incidentRoleFromCode(req.session.originalRadioSelection)
  const { originalReporterUsername } = req.session
  return {
    incidentDetails: {
      incidentDate,
      locationId,
      currentIncidentRoleSelection,
      currentAssociatedPrisonerNumber,
    },
    temporaryData: {
      originalIncidentRoleSelection,
      originalReporterUsername,
    },
  }
}

const deleteSessionData = (req: Request) => {
  delete req.session.redirectUrl
  delete req.session.incidentDate
  delete req.session.incidentLocation
  delete req.session.currentRadioSelection
  delete req.session.currentAssociatedPrisonersNumber
  delete req.session.originalRadioSelection
  delete req.session.originalReporterUsername
}

const stashDataOnSession = (returnUrl: string, dataToStore: StashedIncidentDetails, req: Request) => {
  req.session.redirectUrl = returnUrl
  req.session.incidentDate = dataToStore.incidentDetails.incidentDate
  req.session.incidentLocation = dataToStore.incidentDetails.locationId
  req.session.currentRadioSelection = codeFromIncidentRole(dataToStore.incidentDetails.currentIncidentRoleSelection)
  req.session.currentAssociatedPrisonersNumber = dataToStore.incidentDetails.currentAssociatedPrisonerNumber
  req.session.originalRadioSelection = codeFromIncidentRole(dataToStore.temporaryData.originalIncidentRoleSelection)
  req.session.originalReporterUsername = dataToStore.temporaryData.originalReporterUsername
}

const extractIncidentDetails = (readDraftIncidentDetails: ExistingDraftIncidentDetails): ApiIncidentDetails => {
  return {
    incidentDate: readDraftIncidentDetails.dateTime,
    locationId: readDraftIncidentDetails.locationId,
    currentIncidentRoleSelection: incidentRoleFromCode(readDraftIncidentDetails.incidentRole.roleCode),
    currentAssociatedPrisonerNumber: readDraftIncidentDetails.incidentRole?.associatedPrisonersNumber,
    reporterUsername: readDraftIncidentDetails.startedByUserId,
  }
}

const transformFormDataToStashedData = (formData: SubmittedFormData): StashedIncidentDetails => {
  return {
    incidentDetails: formData.incidentDetails,
    temporaryData: {
      originalIncidentRoleSelection: formData.originalIncidentRoleSelection,
      originalReporterUsername: formData.originalReporterUsername,
    },
  }
}

const transformStashedDataToFormData = (
  data: StashedIncidentDetails,
  originalReporterUsername: string
): InitialFormData => {
  return {
    incidentDetails: data?.incidentDetails,
    originalIncidentRoleSelection: data?.temporaryData?.originalIncidentRoleSelection,
    lastIncidentRoleSelection: data?.incidentDetails?.currentIncidentRoleSelection,
    lastAssociatedPrisonerNumberSelection: data?.incidentDetails?.currentAssociatedPrisonerNumber,
    originalReporterUsername,
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
    prisonerNumber: req.params.prisonerNumber,
    draftId: getDraftIdFromString(req.params.id),
    searchForPersonRequest: req.body.search,
    deletePersonRequest: req.body.deleteAssociatedPrisoner,
    incidentDetails: {
      incidentDate: req.body.incidentDate,
      locationId: req.body.locationId,
      currentIncidentRoleSelection,
      currentAssociatedPrisonerNumber,
      reporterUsername: req.body.originalReporterUsername,
    },
    originalIncidentRoleSelection: incidentRoleFromRadioSelection(req.body.originalIncidentRoleSelection),
    originalPageReferrerUrl: req.query.referrer as string,
    originalReporterUsername: req.body.originalReporterUsername,
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
    incidentDate: getIncidentDate(pageData.formData.incidentDetails?.incidentDate),
    locationId: pageData.formData.incidentDetails?.locationId,
    originalRadioSelection: radioSelectionCodeFromIncidentRole(currentIncidentRoleSelection),
    associatedPrisonersNumber: pageData.formData.incidentDetails?.currentAssociatedPrisonerNumber,
    associatedPrisonersName: pageData.displayData.associatedPrisonersName,
  }
  return res.render(`pages/incidentDetails`, {
    errors: error ? [error] : [],
    prisoner: pageData.displayData.prisoner,
    locations: pageData.displayData.possibleLocations,
    data,
    reportingOfficer: pageData.displayData.reporter || '',
    submitButtonText: 'Save and continue',
    exitButtonHref,
    incitedInput,
    assistedInput,
    originalIncidentRoleSelection: pageData.formData.originalIncidentRoleSelection,
    lastIncidentRoleSelection: pageData.formData.lastIncidentRoleSelection,
    lastAssociatedPrisonerNumberSelection: pageData.formData.lastAssociatedPrisonerNumberSelection,
    originalReporterUsername: pageData.formData.originalReporterUsername,
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
      currentAssociatedPrisonerNumber: null,
      ...stashedData.incidentDetails,
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

const isReviewer = (originalPageReferrer?: string): boolean => {
  return originalPageReferrer?.includes('review')
}

const getIncidentDate = (userProvidedValue?: SubmittedDateTime) => {
  if (userProvidedValue) {
    const {
      date,
      time: { hour, minute },
    } = userProvidedValue
    return { date, hour, minute }
  }
  return null
}

const getTaskListUrl = (draftId: number) => {
  return `/place-the-prisoner-on-report/${draftId}`
}

const redirectToSearchForPersonPage = (res: Response, searchTerm: string) => {
  return res.redirect(`/select-associated-prisoner?searchTerm=${searchTerm}`)
}

const redirectToDeletePersonPage = (res: Response, prisonerToDelete: string) => {
  return res.redirect(`/delete-person?associatedPersonId=${prisonerToDelete}`)
}

const redirectToOffenceSelection = (res: Response, draftId: number, incidentRoleCode: IncidentRole) => {
  return res.redirect(`/offence-code-selection/${draftId}/${radioSelectionCodeFromIncidentRole(incidentRoleCode)}`)
}

const redirectToCheckYourAnswers = (
  res: Response,
  prisonerNumber: string,
  draftId: number,
  isReviewerPage: boolean
) => {
  return res.redirect(`/check-your-answers/${draftId}/${isReviewerPage ? 'review' : 'report'}`)
}

const redirectToTaskList = (res: Response, draftId: number) => {
  return res.redirect(getTaskListUrl(draftId))
}

const chooseNextPageAfterEdit = (
  defaultNextPage: NextPageSelectionAfterEdit,
  incidentRoleChanged: boolean
): NextPageSelectionAfterEdit => {
  if (incidentRoleChanged) {
    return NextPageSelectionAfterEdit.OFFENCE_SELECTION
  }
  return defaultNextPage
}

// TODO - How best to debug (if at all). We need some unoffical way of logging - do not invoke App Insights
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugData = (outputId: string, data: any) => {
  debug(outputId)
  debug(data)
}
