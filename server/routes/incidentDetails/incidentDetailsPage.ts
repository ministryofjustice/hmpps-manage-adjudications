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

type InitialFormData = {
  incidentDetails?: IncidentDetails
  // Hidden
  originalIncidentRoleSelection: IncidentRole
  lastIncidentRoleSelection?: IncidentRole
  lastAssociatedPrisonerNumberSelection?: string
}

// TDODO Initial and Submitted have a lot in common!
type SubmittedFormData = {
  // From URL
  prisonerNumber: string
  draftId?: number
  originalPageReferrerUrl?: string
  // Input data
  incidentDetails: IncidentDetails
  searchForPersonRequest?: string
  deletePersonRequest?: string
  // Hidden input data
  originalIncidentRoleSelection: IncidentRole
  lastIncidentRoleSelection?: IncidentRole
  lastAssociatedPrisonerNumberSelection?: string
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
  currentSelectedPerson?: string
}

type TemporarilySavedData = {
  originalIncidentRoleSelection: IncidentRole
}

type StashedIncidentDetails = {
  incidentDetails: IncidentDetails
  temporaryData?: TemporarilySavedData
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
    debug(requestValues)
    debug(requestData)

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
        },
      }
    }
    deleteSessionData(req)
    debug(data)

    const pageData = await this.getPageDataOnGet(requestValues, data, user)
    renderData(res, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const postValues = extractValuesFromPost(req)
    const postData = getPageActionFromPost(postValues)
    const { user } = res.locals
    debug(postValues)
    debug(postData)

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
        returnUrl = `/incident-details/${postValues.prisonerNumber}/${postValues.draftId}`
      }
      stashDataOnSession(returnUrl, dataToSaveAfterRedirect, req)
      if (postData === PageRequestAction.DELETE_PRISONER) {
        return redirectToDeletePersonPage(res, postValues.incidentDetails.currentSelectedPerson)
      }
      if (postData === PageRequestAction.SEARCH_FOR_PRISONER) {
        const searchValidationError = validatePrisonerSearch({
          searchTerm: postValues.incidentDetails.currentSelectedPerson,
          inputId: postValues.incidentDetails.currentIncidentRoleSelection,
        })
        if (searchValidationError) {
          // Could stash to session and redirect here
          const pageData = await this.getPageDataOnPost(postValues, postValues.incidentDetails, user)
          return renderData(res, pageData, searchValidationError)
        }
        return redirectToSearchForPersonPage(res, postValues.incidentDetails.currentSelectedPerson)
      }
    }

    const validationError = validateForm({
      incidentDate: postValues.incidentDetails?.incidentDate,
      locationId: postValues.incidentDetails?.locationId,
      incidentRole: postValues.incidentDetails?.currentIncidentRoleSelection,
      associatedPrisonersNumber: postValues.incidentDetails?.currentSelectedPerson,
    })
    if (validationError) {
      // Could stash to session and redirect here
      const pageData = await this.getPageDataOnPost(postValues, postValues.incidentDetails, user)
      return renderData(res, pageData, validationError)
    }

    const incidentDetailsToSave = postValues.incidentDetails

    try {
      if (this.pageOptions.isEdit()) {
        await this.saveToApiUpdate(postValues.draftId, incidentDetailsToSave, user as User)

        // TODO - THis probably isn't enough - we need to delete the existing offences don't we?
        let defaultNextPage = NextPageSelectionAfterEdit.TASK_LIST
        if (this.pageOptions.isPreviouslySubmitted()) {
          defaultNextPage = NextPageSelectionAfterEdit.CHECK_YOUR_ANSWERS
        }
        const nextPageChoice = chooseNextPageAfterEdit(
          defaultNextPage,
          postValues.originalIncidentRoleSelection,
          incidentDetailsToSave.currentIncidentRoleSelection
        )
        switch (nextPageChoice) {
          case NextPageSelectionAfterEdit.OFFENCE_SELECTION:
            return redirectToOffenceSelection(
              res,
              postValues.draftId,
              incidentDetailsToSave.currentIncidentRoleSelection
            )
          case NextPageSelectionAfterEdit.CHECK_YOUR_ANSWERS:
            const isReviewerPage = isReviewer(postValues.originalPageReferrerUrl)
            return redirectToCheckYourAnswers(res, postValues.prisonerNumber, postValues.draftId, isReviewerPage)
          default:
          // Fall through
        }
        return redirectToTaskList(res, postValues.prisonerNumber, postValues.draftId)
      }
      const newDraftData = await this.saveToApiNew(postValues.prisonerNumber, incidentDetailsToSave, user as User)
      return redirectToOffenceSelection(
        res,
        newDraftData.draftAdjudication.id,
        incidentDetailsToSave.currentIncidentRoleSelection
      )
    } catch (postError) {
      if (this.pageOptions.isEdit()) {
        setUpRedirectForEditError(res, postValues.prisonerNumber, postError, postValues.draftId)
      } else {
        setUpRedirectForCreationError(res, postValues.prisonerNumber, postError)
      }
      throw postError
    }
  }

  readFromApi = async (draftId: number, user: User): Promise<IncidentDetails> => {
    return extractIncidentDetails(await this.placeOnReportService.getDraftIncidentDetailsForEditing(draftId, user))
  }

  saveToApiNew = async (
    prisonerNumber: string,
    data: IncidentDetails,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    return await this.placeOnReportService.startNewDraftAdjudication(
      formatDate(data.incidentDate),
      data.locationId,
      prisonerNumber,
      data.currentSelectedPerson,
      codeFromIncidentRole(data.currentIncidentRoleSelection),
      currentUser
    )
  }

  saveToApiUpdate = async (
    draftId: number,
    data: IncidentDetails,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    return await this.placeOnReportService.editDraftIncidentDetails(
      draftId,
      formatDate(data.incidentDate),
      data.locationId,
      data.currentSelectedPerson,
      codeFromIncidentRole(data.currentIncidentRoleSelection),
      currentUser
    )
  }

  getPageDataOnGet = async (
    requestValues: RequestValues,
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
        currentUser,
        data.incidentDetails?.currentSelectedPerson
      ),
      exitButtonData,
      formData: transformStashedDataToFormData(data),
    }
  }

  getPageDataOnPost = async (
    postValues: SubmittedFormData,
    data: IncidentDetails,
    currentUser: User
  ): Promise<PageData> => {
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
        currentUser,
        postValues.incidentDetails?.currentSelectedPerson
      ),
      exitButtonData,
      formData: postValues,
    }
  }

  getDisplayData = async (
    prisonerNumber: string,
    currentUser: User,
    currentSelectedPerson?: string
  ): Promise<DisplayData> => {
    const [prisoner, reporter] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, currentUser),
      // TODONOW - Sort out reporter - is it relevant on new draft? Where does it come from?
      this.placeOnReportService.getReporterName(currentUser.username, currentUser),
    ])
    const { agencyId } = prisoner.assignedLivingUnit
    const possibleLocations = await this.locationService.getIncidentLocations(agencyId, currentUser)

    // TODO -= selectedPerson -> currentAssociatedPrisonerNumber
    const associatedPrisonersName = currentSelectedPerson
      ? await this.getCurrentAssociatedPrisonersName(currentSelectedPerson, currentUser)
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
}

const extractValuesFromRequest = (req: Request): RequestValues => {
  const values = {
    draftId: getDraftIdFromString(req.params.id),
    prisonerNumber: req.params.prisonerNumber,
    selectedPerson: JSON.stringify(req.query.selectedPerson)?.replace(/"/g, ''),
    deleteWanted: req.query.personDeleted as string,
    originalPageReferrerUrl: req.query.referrer as string,
  }
  debug(values)
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
  const currentSelectedPerson = req.session.currentAssociatedPrisonersNumber
  const originalIncidentRoleSelection = incidentRoleFromCode(req.session.originalRadioSelection)
  return {
    incidentDetails: {
      incidentDate,
      locationId,
      currentIncidentRoleSelection,
      currentSelectedPerson,
    },
    temporaryData: {
      originalIncidentRoleSelection,
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
}

const stashDataOnSession = (returnUrl: string, dataToStore: StashedIncidentDetails, req: Request) => {
  req.session.redirectUrl = returnUrl
  req.session.incidentDate = dataToStore.incidentDetails.incidentDate
  req.session.incidentLocation = dataToStore.incidentDetails.locationId
  req.session.currentRadioSelection = codeFromIncidentRole(dataToStore.incidentDetails.currentIncidentRoleSelection)
  req.session.currentAssociatedPrisonersNumber = dataToStore.incidentDetails.currentSelectedPerson
  req.session.originalRadioSelection = codeFromIncidentRole(dataToStore.temporaryData.originalIncidentRoleSelection)
}

const extractIncidentDetails = (readDraftIncidentDetails: ExistingDraftIncidentDetails): IncidentDetails => {
  return {
    incidentDate: readDraftIncidentDetails.dateTime,
    locationId: readDraftIncidentDetails.locationId,
    currentIncidentRoleSelection: incidentRoleFromCode(readDraftIncidentDetails.incidentRole.roleCode),
    currentSelectedPerson: readDraftIncidentDetails.incidentRole?.associatedPrisonersNumber,
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
    incidentDetails: data.incidentDetails,
    originalIncidentRoleSelection: data.temporaryData?.originalIncidentRoleSelection,
    lastIncidentRoleSelection: data.incidentDetails?.currentIncidentRoleSelection,
    lastAssociatedPrisonerNumberSelection: data.incidentDetails?.currentSelectedPerson,
  }
}

const extractValuesFromPost = (req: Request): SubmittedFormData => {
  const currentIncidentRoleSelection = incidentRoleFromRadioSelection(req.body.currentRadioSelected)
  const previousIncidentRoleSelection = incidentRoleFromRadioSelection(req.body.lastIncidentRoleSelection)
  let currentSelectedPerson = null
  if (previousIncidentRoleSelection !== currentIncidentRoleSelection) {
    if (currentIncidentRoleSelection === IncidentRole.ASSISTED) {
      currentSelectedPerson = req.body.assistedInput
    } else if (currentIncidentRoleSelection === IncidentRole.INCITED) {
      currentSelectedPerson = req.body.incitedInput
    }
  } else {
    currentSelectedPerson = req.body.lastAssociatedPrisonerNumberSelection
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
      currentSelectedPerson,
    },
    originalIncidentRoleSelection: incidentRoleFromRadioSelection(req.body.originalIncidentRoleSelection),
    originalPageReferrerUrl: req.query.referrer as string,
  }
  debug(values)
  return values
}

const getPageActionFromPost = (reqData: SubmittedFormData): PageRequestAction => {
  // TODO - i don't think we need to distinguihs between input types as we know from the radio button selected which one they have pressed?!
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
      exitButtonHref = getTaskListUrl(pageData.exitButtonData.prisonerNumber, pageData.exitButtonData.draftId)
    }
  }
  const currentIncidentRoleSelection = pageData.formData.incidentDetails?.currentIncidentRoleSelection
  const currentSelectedPerson = pageData.formData.incidentDetails?.currentSelectedPerson
  let incitedInput = null
  let assistedInput = null
  if (currentIncidentRoleSelection && currentSelectedPerson) {
    if (currentIncidentRoleSelection === IncidentRole.ASSISTED) {
      assistedInput = currentSelectedPerson
    } else if (currentIncidentRoleSelection === IncidentRole.INCITED) {
      incitedInput = currentSelectedPerson
    }
  }
  const data = {
    incidentDate: getIncidentDate(pageData.formData.incidentDetails?.incidentDate),
    locationId: pageData.formData.incidentDetails?.locationId,
    originalRadioSelection: radioSelectionCodeFromIncidentRole(currentIncidentRoleSelection),
    associatedPrisonersNumber: pageData.formData.incidentDetails?.currentSelectedPerson,
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
      currentSelectedPerson: requestData.selectedPerson,
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
      currentSelectedPerson: null,
      ...stashedData.incidentDetails,
    },
    temporaryData: stashedData.temporaryData,
  }
}

const getDraftIdFromString = (draftId: string): number => {
  debug(`DRAFT ${draftId}`)
  let draftIdValue: number = null
  if (draftId) {
    draftIdValue = parseInt(draftId, 10)
    debug(`DO IT`)
  }
  debug(`DRAFTV ${draftIdValue}`)
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
  // TODO - Is there not a better way? Why is the referrer even passed in?
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

const getTaskListUrl = (prisonerNumber: string, draftId: number) => {
  return `/place-the-prisoner-on-report/${prisonerNumber}/${draftId}`
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
  return res.redirect(`/check-your-answers/${prisonerNumber}/${draftId}/${isReviewerPage ? 'review' : 'report'}`)
}

const redirectToTaskList = (res: Response, prisonerNumber: string, draftId: number) => {
  return res.redirect(getTaskListUrl(prisonerNumber, draftId))
}

const setUpRedirectForEditError = (res: Response, prisonerNumber: string, error: any, draftId: number) => {
  logger.error(`Failed to post edited incident details for draft adjudication: ${error}`)
  res.locals.redirectUrl = `/offence-details/${prisonerNumber}/${draftId}`
}

const setUpRedirectForCreationError = (res: Response, prisonerNumber: string, error: any) => {
  logger.error(`Failed to post incident details for draft adjudication: ${error}`)
  res.locals.redirectUrl = `/incident-statement/${prisonerNumber}`
}

const chooseNextPageAfterEdit = (
  defaultNextPage: NextPageSelectionAfterEdit,
  originalIncidentRole: IncidentRole,
  currentIncidentRole: IncidentRole
): NextPageSelectionAfterEdit => {
  if (originalIncidentRole !== currentIncidentRole) {
    return NextPageSelectionAfterEdit.OFFENCE_SELECTION
  }
  return defaultNextPage
}
