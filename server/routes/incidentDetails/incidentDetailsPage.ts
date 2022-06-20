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
import { formatDate } from '../../utils/utils'
import { User } from '../../data/hmppsAuthClient'
import { PrisonLocation } from '../../data/PrisonLocationResult'
import { DraftAdjudicationResult } from '../../data/DraftAdjudicationResult'
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
  // This PRN/DraftID stuff is duplicated a lot - extract?
  prisonerNumber: string
  draftId?: number
  originalPageReferrerUrl?: string
}

type IncidentDetails = {
  incidentDate: SubmittedDateTime
  locationId: number
}

type ApiIncidentDetails = IncidentDetails & {
  reporterUsername: string
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
      locationId: postValues.incidentDetails?.locationId,
    })
    if (validationError) {
      // Could stash to session and redirect here
      const pageData = await this.getPageDataOnPost(postValues, user)
      return renderData(res, pageData, validationError)
    }

    const incidentDetailsToSave = postValues.incidentDetails

    try {
      if (this.pageOptions.isEdit()) {
        await this.saveToApiUpdate(postValues.draftId, incidentDetailsToSave, user as User)

        // TODO - Are these the right screens?
        if (this.pageOptions.isPreviouslySubmitted()) {
          return redirectToOffenceDetails(res, postValues.draftId)
        }
        return redirectToTaskList(res, postValues.draftId)
      }
      const newDraftData = await this.saveToApiNew(postValues.prisonerNumber, incidentDetailsToSave, user as User)
      return redirectToApplcableRule(res, newDraftData.draftAdjudication.id)
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
      currentUser
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
      currentUser
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
    const { agencyId } = prisoner.assignedLivingUnit
    const possibleLocations = await this.locationService.getIncidentLocations(agencyId, currentUser)

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
    draftId: getDraftIdFromString(req.params.id),
    prisonerNumber: req.params.prisonerNumber,
    originalPageReferrerUrl: req.query.referrer as string,
  }
  return values
}

const extractIncidentDetails = (readDraftIncidentDetails: ExistingDraftIncidentDetails): ApiIncidentDetails => {
  return {
    incidentDate: readDraftIncidentDetails.dateTime,
    locationId: readDraftIncidentDetails.locationId,
    reporterUsername: readDraftIncidentDetails.startedByUserId,
  }
}

const extractValuesFromPost = (req: Request): SubmittedFormData => {
  const values = {
    prisonerNumber: req.params.prisonerNumber,
    draftId: getDraftIdFromString(req.params.id),
    incidentDetails: {
      incidentDate: req.body.incidentDate,
      locationId: req.body.locationId,
      reporterUsername: req.body.originalReporterUsername,
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
    incidentDate: getIncidentDate(pageData.formData.incidentDetails?.incidentDate),
    locationId: pageData.formData.incidentDetails?.locationId,
  }
  return res.render(`pages/incidentDetails`, {
    errors: error ? [error] : [],
    prisoner: pageData.displayData.prisoner,
    locations: pageData.displayData.possibleLocations,
    data,
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
  return adjudicationUrls.taskList.urls.start(draftId)
}

const redirectToApplcableRule = (res: Response, draftId: number) => {
  return res.redirect(adjudicationUrls.ageOfPrisoner.urls.start(draftId))
}

const redirectToOffenceDetails = (res: Response, draftId: number) => {
  return res.redirect(adjudicationUrls.detailsOfOffence.urls.start(draftId))
}

const redirectToTaskList = (res: Response, draftId: number) => {
  return res.redirect(getTaskListUrl(draftId))
}
