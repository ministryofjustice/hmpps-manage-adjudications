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
}

type SubmittedFormData = {
  prisonerNumber: string
  draftId?: number
  incidentDetails: IncidentDetails
  postType: string
  searchForPerson?: string
  deletePersonRequest?: boolean
  // Hidden
  originalIncidentRoleSelection: IncidentRole
}

type ExitButtonData = {
  prisonerNumber: string
  draftId: number
}

type RequestValues = {
  // This Ul stuff is duplicated a lot - extract?
  prisonerNumber: string
  draftId?: number
  selectedPerson?: string
  deleteWanted?: string
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

// TODONOW - Remove as data is elsewhere now
type ExistingDraftInformation = {
  draftId: number
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

    let data: StashedIncidentDetails = null
    if (requestData !== PageRequestAction.STANDARD) {
      const sessionData = popDataFromSessionAndReset(req)
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

    const pageData = await this.getPageData(requestValues, data, user)
    renderData(res, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const postValues = extractValuesFromPost(req)
    const postData = getPageActionFromPost(postValues)
    const { user } = res.locals

    if (postData !== PageRequestAction.STANDARD) {
      const dataToSaveAfterRedirect = transformFormDataToStashedData(postValues)
      stashDataOnSession(dataToSaveAfterRedirect, req)
      if (postData === PageRequestAction.DELETE_PRISONER) {
        return redirectToDeletePersonPage(res, postValues.incidentDetails.currentSelectedPerson)
      }
      if (postData === PageRequestAction.SEARCH_FOR_PRISONER) {
        const searchValidationError = validatePrisonerSearch({
          searchTerm: postValues.searchForPerson,
          inputId: postValues.incidentDetails.currentIncidentRoleSelection,
        })
        if (searchValidationError) {
          // Could stash to session and redirect here
          const pageData = await this.getPageDataOnPost(postValues, postValues.incidentDetails, user)
          return renderData(res, pageData, searchValidationError)
        }
        return redirectToSearchForPersonPage(res, postValues.searchForPerson)
      }
    }

    const validationError = validateForm({
      incidentDate: postValues.incidentDetails?.incidentDate,
      locationId: postValues.incidentDetails?.locationId,
      incidentRole: postValues.incidentDetails?.currentIncidentRoleSelection,
      associatedPrisonersNumber: postValues.incidentDetails?.currentSelectedPerson,
    })
    if (validationError !== null) {
      // Could stash to session and redirect here
      const pageData = await this.getPageDataOnPost(postValues, postValues.incidentDetails, user)
      return renderData(res, pageData, validationError)
    }

    const incidentDetailsToSave = postValues.incidentDetails

    try {
      if (this.pageOptions.isEdit()) {
        const existingDraftInformation = getExistingDraftInformation(req)
        await this.saveToApiUpdate(existingDraftInformation, incidentDetailsToSave, user as User)

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
              existingDraftInformation.draftId,
              incidentDetailsToSave.currentIncidentRoleSelection
            )
          case NextPageSelectionAfterEdit.CHECK_YOUR_ANSWERS:
            return redirectToCheckYourAnswers(res, postValues.prisonerNumber, existingDraftInformation.draftId)
          default:
          // Fall through
        }
        return redirectToTaskList(res, postValues.prisonerNumber, existingDraftInformation)
      }
      const newDraftData = await this.saveToApiNew(postValues.prisonerNumber, incidentDetailsToSave, user as User)
      return redirectToOffenceSelection(
        res,
        newDraftData.draftAdjudication.id,
        incidentDetailsToSave.currentIncidentRoleSelection
      )
    } catch (postError) {
      if (this.pageOptions.isEdit()) {
        const existingDraftInformation = getExistingDraftInformation(req)
        setUpRedirectForEditError(res, postValues.prisonerNumber, postError, existingDraftInformation)
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
    draftInformation: ExistingDraftInformation,
    data: IncidentDetails,
    currentUser: User
  ): Promise<any> => {
    return await this.placeOnReportService.editDraftIncidentDetails(
      draftInformation.draftId,
      formatDate(data.incidentDate),
      data.locationId,
      data.currentSelectedPerson,
      codeFromIncidentRole(data.currentIncidentRoleSelection),
      currentUser
    )
  }

  getPageData = async (
    requestValues: RequestValues,
    data: StashedIncidentDetails,
    currentUser: User
  ): Promise<PageData> => {
    let exitButtonData: ExitButtonData = null
    if (this.pageOptions.isEdit()) {
      exitButtonData = {
        prisonerNumber: requestValues.prisonerNumber,
        draftId: requestValues.draftId,
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

  // TODONOW - Duplicate - combine!
  getPageDataOnPost = async (
    postValues: SubmittedFormData,
    data: IncidentDetails,
    currentUser: User
  ): Promise<PageData> => {
    let exitButtonData: ExitButtonData = null
    if (this.pageOptions.isEdit()) {
      exitButtonData = {
        prisonerNumber: postValues.prisonerNumber,
        draftId: postValues.draftId,
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
    // TODONOW - Sort out stuff in incidentDetailsEdit (getAssociatedPrisonersNumber)
    const [prisoner, reporter] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, currentUser),
      this.placeOnReportService.getReporterName(currentUser.username, currentUser),
    ])
    const { agencyId } = prisoner.assignedLivingUnit
    const possibleLocations = await this.locationService.getIncidentLocations(agencyId, currentUser)

    // TODONOW -= selectedPerson -> associatedPrisonerNumber
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
    draftId: getDraftIdFromString(req.params.draftId),
    prisonerNumber: req.params.prisonerNumber,
    selectedPerson: JSON.stringify(req.query.selectedPerson)?.replace(/"/g, ''),
    deleteWanted: req.query.personDeleted as string,
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

const popDataFromSessionAndReset = (req: Request): StashedIncidentDetails => {
  const { incidentDate } = req.session
  const locationId = req.session.incidentLocation
  // TODONOW - MOSSING SESSION RADIO SELECTION
  const currentIncidentRoleSelection = incidentRoleFromCode(req.session.originalRadioSelection)
  const currentSelectedPerson = req.session.originalAssociatedPrisonersNumber
  const originalIncidentRoleSelection = incidentRoleFromCode(req.session.originalRadioSelection)
  delete req.session.incidentDate
  delete req.session.incidentLocation
  // TODONOW - MOSSING SESSION RADIO SELECTION
  delete req.session.originalRadioSelection
  delete req.session.originalAssociatedPrisonersNumber
  delete req.session.originalRadioSelection
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

const stashDataOnSession = (dataToStore: StashedIncidentDetails, req: Request) => {
  req.session.incidentDate = dataToStore.incidentDetails.incidentDate
  req.session.incidentLocation = dataToStore.incidentDetails.locationId
  // TODONOW - MOSSING SESSION RADIO SELECTION
  req.session.originalRadioSelection = codeFromIncidentRole(dataToStore.incidentDetails.currentIncidentRoleSelection)
  req.session.originalAssociatedPrisonersNumber = dataToStore.incidentDetails.currentSelectedPerson
  req.session.originalRadioSelection = codeFromIncidentRole(dataToStore.temporaryData.originalIncidentRoleSelection)
}

const getExistingDraftInformation = (req: Request): ExistingDraftInformation => {
  return {
    draftId: getDraftIdFromString(req.params.id as string),
  }
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
  }
}

const extractValuesFromPost = (req: Request): SubmittedFormData => {
  const currentIncidentRoleSelection = incidentRoleFromRadioSelection(req.body.currentRadioSelected)
  let currentSelectedPerson = req.body.incitedInput
  if (currentIncidentRoleSelection === IncidentRole.ASSISTED) {
    currentSelectedPerson = req.body.assistedInput
  }
  const values = {
    prisonerNumber: req.params.prisonerNumber,
    draftId: getDraftIdFromString(req.params.draftId),
    postType: req.body.search,
    searchForPerson: req.body.search,
    deletePersonRequest: req.body.deleteAssociatedPrisoner,
    incidentDetails: {
      incidentDate: req.body.incidentDate,
      locationId: req.body.locationId,
      currentIncidentRoleSelection,
      currentSelectedPerson,
    },
    originalIncidentRoleSelection: incidentRoleFromRadioSelection(req.body.originalRadioSelected),
  }
  debug(values)
  return values
}

const getPageActionFromPost = (reqData: SubmittedFormData): PageRequestAction => {
  // TODO - i don't think we need to distinguihs between input types as we know from the radio button selected which one they have pressed?!
  if (reqData.postType === 'incitedSearchSubmit' || reqData.postType === 'assistedSearchSubmit') {
    return PageRequestAction.SEARCH_FOR_PRISONER
  }
  if (reqData.postType === 'incitedDelete' || reqData.postType === 'assistedDelete') {
    return PageRequestAction.DELETE_PRISONER
  }
  return PageRequestAction.STANDARD
}

const renderData = (res: Response, pageData: PageData, error: FormError) => {
  let exitButtonHref = null
  if (pageData.exitButtonData !== null) {
    exitButtonHref = getTaskListUrl(pageData.exitButtonData.prisonerNumber, pageData.exitButtonData.draftId)
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
  })
}

const updateDataOnSearchReturn = (
  stashedData: StashedIncidentDetails,
  requestData: RequestValues
): StashedIncidentDetails => {
  if (!requestData.selectedPerson) {
    return stashedData
  }
  return {
    incidentDetails: {
      currentSelectedPerson: requestData.selectedPerson,
      ...stashedData.incidentDetails,
    },
    ...stashedData,
  }
}

const updateDataOnDeleteReturn = (
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
    ...stashedData,
  }
}

const getDraftIdFromString = (draftId: string): number => {
  let draftIdValue: number = null
  if (draftId !== null) {
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
  return res.redirect(`/offence-code-selection/${draftId}/${incidentRoleFromCode(incidentRoleCode)}`)
}

const redirectToCheckYourAnswers = (res: Response, prisonerNumber: string, draftId: number) => {
  // TODONOW -     const exitButtonHref = (referrer as string)?.includes('review')
  return res.redirect(`/check-your-answers/${prisonerNumber}/${draftId}/review`)
}

const redirectToTaskList = (
  res: Response,
  prisonerNumber: string,
  existingDraftInformation: ExistingDraftInformation
) => {
  return res.redirect(getTaskListUrl(prisonerNumber, existingDraftInformation.draftId))
}

const setUpRedirectForEditError = (
  res: Response,
  prisonerNumber: string,
  error: any,
  existingDraftInformation: ExistingDraftInformation
) => {
  logger.error(`Failed to post edited incident details for draft adjudication: ${error}`)
  res.locals.redirectUrl = `/offence-details/${prisonerNumber}/${existingDraftInformation.draftId}`
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
