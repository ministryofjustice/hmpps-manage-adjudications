/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './incidentDetailsValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService, {
  ExistingDraftIncidentDetails,
  PrisonerResultSummary,
} from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { convertSubmittedDateTimeToDateObject, formatDate, formatDateForDatePicker } from '../../utils/utils'
import { User } from '../../data/hmppsManageUsersClient'
import { PrisonLocation } from '../../data/PrisonLocationResult'
import { DraftAdjudicationResult, PrisonerGender } from '../../data/DraftAdjudicationResult'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  displayData: DisplayDataFromApis
  formData?: InitialFormData
  exitButtonData?: ExitButtonData
  error?: FormError | FormError[]
}

type DisplayDataFromApis = {
  reporter: string
  prisoner: PrisonerResultSummary
  possibleLocations: PrisonLocation[]
}

type InitialFormData = {
  incidentDetails?: IncidentDetails
  // Hidden
  originalReporterUsername: string
}

type SubmittedFormData = {
  // From URL
  prisonerNumber: string
  draftId?: number
  originalPageReferrerUrl?: string
  // Hidden
  originalReporterUsername: string
  // Input data
  incidentDetails: IncidentDetails
}

type ExitButtonData = {
  prisonerNumber: string
  draftId: number
  prisonerReportUrl: string
}

type RequestValues = {
  prisonerNumber: string
  draftId?: number
  originalPageReferrerUrl?: string
}

type IncidentDetails = {
  incidentDate: SubmittedDateTime
  discoveryDate: SubmittedDateTime
  locationId: number
  discoveryRadioSelected?: string
}

type ApiIncidentDetails = IncidentDetails & {
  reporterUsername: string
}

type IncidentDetailsAndGender = IncidentDetails & {
  gender: PrisonerGender
}

export enum PageRequestType {
  CREATION,
  EDIT,
  EDIT_SUBMITTED,
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
    const { user } = res.locals

    let readApiIncidentDetails: ApiIncidentDetails = null
    if (this.pageOptions.isEdit()) {
      readApiIncidentDetails = await this.readFromApi(requestValues.draftId, user as User)
    }

    let originalReporterUsernameForPage = user.username
    if (this.pageOptions.isEdit()) {
      originalReporterUsernameForPage = readApiIncidentDetails.reporterUsername
    }

    const pageData = await this.getPageDataOnGet(
      requestValues,
      originalReporterUsernameForPage,
      readApiIncidentDetails,
      user
    )
    renderData(res, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const postValues = extractValuesFromPost(req)
    const { user } = res.locals

    const validationError = validateForm({
      incidentDate: postValues.incidentDetails?.incidentDate,
      discoveryDate: postValues.incidentDetails?.discoveryDate,
      locationId: postValues.incidentDetails?.locationId,
      discoveryRadioSelected: postValues.incidentDetails?.discoveryRadioSelected,
    })
    if (validationError) {
      const pageData = await this.getPageDataOnPost(postValues, user)
      return renderData(res, pageData, validationError)
    }

    try {
      if (this.pageOptions.isEdit()) {
        const incidentDetailsToUpdate = postValues.incidentDetails
        await this.saveToApiUpdate(postValues.draftId, incidentDetailsToUpdate, user as User)
        const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(
          postValues.draftId,
          user
        )
        const nextPageUrl = await this.placeOnReportService.getNextOffencesUrl(
          draftAdjudication.offenceDetails,
          draftAdjudication.id
        )
        return res.redirect(nextPageUrl)
      }

      const prisonerGender = await this.getPrisonerGender(req, postValues.prisonerNumber, user)
      const incidentDetailsToCreate = { ...postValues.incidentDetails, gender: prisonerGender }
      const newDraftData = await this.saveToApiNew(postValues.prisonerNumber, incidentDetailsToCreate, user as User)
      return redirectToApplicableRule(res, newDraftData.draftAdjudication.id)
    } catch (postError) {
      if (this.pageOptions.isEdit()) {
        this.setUpRedirectForEditError(res, postValues.prisonerNumber, postError, postValues.draftId)
      } else {
        this.setUpRedirectForCreationError(res, postValues.prisonerNumber, postValues.draftId, postError)
      }
      throw postError
    }
  }

  getPrisonerGender = async (req: Request, prisonerNumber: string, user: User): Promise<PrisonerGender> => {
    if (this.placeOnReportService.getPrisonerGenderFromSession(req)) {
      return this.placeOnReportService.getAndDeletePrisonerGenderFromSession(req)
    }
    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    return PrisonerGender[prisoner.physicalAttributes.gender.toUpperCase() as keyof typeof PrisonerGender]
  }

  readFromApi = async (draftId: number, user: User): Promise<ApiIncidentDetails> => {
    return extractIncidentDetails(await this.placeOnReportService.getDraftIncidentDetailsForEditing(draftId, user))
  }

  saveToApiNew = async (
    prisonerNumber: string,
    data: IncidentDetailsAndGender,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    // eslint-disable-next-line no-return-await
    return await this.placeOnReportService.startNewDraftAdjudication(
      formatDate(data.incidentDate),
      data.locationId,
      prisonerNumber,
      currentUser,
      data.gender,
      formatDate(data.discoveryDate)
    )
  }

  saveToApiUpdate = async (
    draftId: number,
    data: IncidentDetails,
    currentUser: User
  ): Promise<DraftAdjudicationResult> => {
    // eslint-disable-next-line no-return-await
    return await this.placeOnReportService.editDraftIncidentDetails(
      draftId,
      formatDate(data.incidentDate),
      data.locationId,
      currentUser,
      formatDate(data.discoveryDate)
    )
  }

  getPageDataOnGet = async (
    requestValues: RequestValues,
    originalReporterUsername: string,
    readApiIncidentDetails: ApiIncidentDetails,
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
      displayData: await this.getDisplayData(requestValues.prisonerNumber, originalReporterUsername, currentUser),
      exitButtonData,
      formData: {
        incidentDetails: readApiIncidentDetails,
        originalReporterUsername,
      },
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
        currentUser
      ),
      exitButtonData,
      formData: postValues,
    }
  }

  getDisplayData = async (
    prisonerNumber: string,
    originalReporterUsername: string,
    currentUser: User
  ): Promise<DisplayDataFromApis> => {
    const [prisoner, reporter] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, currentUser),
      this.placeOnReportService.getReporterName(originalReporterUsername, currentUser),
    ])
    const possibleLocations = await this.locationService.getIncidentLocations(currentUser.meta.caseLoadId, currentUser)

    return {
      reporter,
      prisoner,
      possibleLocations,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpRedirectForEditError = (res: Response, prisonerNumber: string, error: any, draftId: number) => {
    logger.error(`Failed to post edited incident details for draft adjudication: ${error}`)
    res.locals.redirectUrl = this.pageOptions.isPreviouslySubmitted()
      ? adjudicationUrls.incidentDetails.urls.submittedEdit(prisonerNumber, draftId)
      : adjudicationUrls.incidentDetails.urls.edit(prisonerNumber, draftId)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpRedirectForCreationError = (res: Response, prisonerNumber: string, draftId: number, error: any) => {
    logger.error(`Failed to post incident details for draft adjudication: ${error}`)
    res.locals.redirectUrl = adjudicationUrls.incidentDetails.urls.start(prisonerNumber)
  }
}

const extractValuesFromRequest = (req: Request): RequestValues => {
  const values = {
    draftId: getDraftIdFromString(req.params.draftId),
    prisonerNumber: req.params.prisonerNumber,
    originalPageReferrerUrl: req.query.referrer as string,
  }
  return values
}

const calculateRadioValue = (dateTime: SubmittedDateTime, dateOfDiscovery: SubmittedDateTime) => {
  if (formatDate(dateTime) === formatDate(dateOfDiscovery)) {
    return 'Yes'
  }
  return 'No'
}

const extractIncidentDetails = (readDraftIncidentDetails: ExistingDraftIncidentDetails): ApiIncidentDetails => {
  const radioValue = calculateRadioValue(
    readDraftIncidentDetails.dateTime,
    readDraftIncidentDetails.dateTimeOfDiscovery
  )

  return {
    incidentDate: readDraftIncidentDetails.dateTime,
    discoveryDate: radioValue === 'Yes' ? null : readDraftIncidentDetails.dateTimeOfDiscovery,
    locationId: readDraftIncidentDetails.locationId,
    discoveryRadioSelected: radioValue,
    reporterUsername: readDraftIncidentDetails.startedByUserId,
  }
}

const extractValuesFromPost = (req: Request): SubmittedFormData => {
  const { discoveryDate } = req.body

  const discoveryDateTime = req.body.discoveryRadioSelected === 'Yes' ? req.body.incidentDate : discoveryDate

  const values = {
    prisonerNumber: req.params.prisonerNumber,
    draftId: getDraftIdFromString(req.params.draftId),
    incidentDetails: {
      incidentDate: req.body.incidentDate,
      discoveryDate: discoveryDateTime,
      locationId: req.body.locationId,
      reporterUsername: req.body.originalReporterUsername,
      discoveryRadioSelected: req.body.discoveryRadioSelected,
    },
    originalPageReferrerUrl: req.query.referrer as string,
    originalReporterUsername: req.body.originalReporterUsername,
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
  const data = {
    incidentDate: convertSubmittedDateTimeToDateObject(pageData.formData.incidentDetails?.incidentDate),
    discoveryDate: convertSubmittedDateTimeToDateObject(pageData.formData.incidentDetails?.discoveryDate),
    locationId: pageData.formData.incidentDetails?.locationId,
    discoveryRadioSelected: pageData.formData.incidentDetails?.discoveryRadioSelected,
  }
  return res.render(`pages/incidentDetails`, {
    errors: error ? [error] : [],
    prisoner: pageData.displayData.prisoner,
    locations: pageData.displayData.possibleLocations,
    data,
    today: formatDateForDatePicker(new Date().toISOString(), 'short'),
    reportingOfficer: pageData.displayData.reporter || '',
    submitButtonText: 'Save and continue',
    exitButtonHref,
    originalReporterUsername: pageData.formData.originalReporterUsername,
  })
}

const getDraftIdFromString = (draftId: string): number => {
  let draftIdValue: number = null
  if (draftId) {
    draftIdValue = parseInt(draftId, 10)
  }
  return draftIdValue
}

const getTaskListUrl = (draftId: number) => {
  return adjudicationUrls.taskList.urls.start(draftId)
}

const redirectToApplicableRule = (res: Response, draftId: number) => {
  return res.redirect(adjudicationUrls.ageOfPrisoner.urls.start(draftId))
}
