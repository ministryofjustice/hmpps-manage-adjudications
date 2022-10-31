/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './scheduleHearingValidation'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { FormError, SubmittedDateTime } from '../../../@types/template'
import { PrisonLocation } from '../../../data/PrisonLocationResult'
import { User } from '../../../data/hmppsAuthClient'
import { PrisonerResultSummary } from '../../../services/placeOnReportService'

type InitialFormData = {
  hearingDetails?: HearingDetails
}

type SubmittedFormData = InitialFormData

type DisplayDataFromApis = {
  possibleLocations: PrisonLocation[]
  prisoner: PrisonerResultSummary
}

type PageData = {
  displayData: DisplayDataFromApis
  formData?: InitialFormData
  error?: FormError | FormError[]
}

type HearingDetails = {
  hearingDate: SubmittedDateTime
  locationId: number
  id?: number
}

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class scheduleHearingRoutes {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    // eslint-disable-next-line prefer-const
    let readApiHearingDetails: HearingDetails = null
    // if (this.pageOptions.isEdit()) {
    //   readApiHearingDetails = await this.readFromApi(req.params.hearingId, user as User)
    // }

    const pageData = await this.getPageDataOnGet(adjudicationNumber, readApiHearingDetails, user)

    renderData(res, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { locationId, hearingDate } = req.body
    const postValues = extractValuesFromPost(req)
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const validationError = validateForm({
      hearingDate,
      locationId,
    })
    if (validationError) {
      const pageData = await this.getPageDataOnGet(adjudicationNumber, postValues.hearingDetails, user)
      return renderData(res, pageData, validationError)
    }
    // save this data
    return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
  }

  //  this is for the edit version
  // readFromApi = async (adjudicationNumber: number, hearingId: number, user: User): Promise<HearingDetails> => {
  //   const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
  //     adjudicationNumber,
  //     user
  //   )
  // filter through hearings to find the correct hearingId and return details
  // }

  getPageDataOnGet = async (
    adjudicationNumber: number,
    hearingDetails: HearingDetails,
    user: User
  ): Promise<PageData> => {
    return {
      displayData: await this.getDisplayData(adjudicationNumber, user),
      formData: {
        hearingDetails,
      },
    }
  }

  getDisplayData = async (adjudicationNumber: number, user: User): Promise<DisplayDataFromApis> => {
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user)
    const { agencyId } = prisoner.assignedLivingUnit
    const possibleLocations = await this.locationService.getIncidentLocations(agencyId, user)

    return {
      prisoner,
      possibleLocations,
    }
  }
}

const renderData = (res: Response, pageData: PageData, error: FormError) => {
  const data = {
    hearingDate: getHearingDate(pageData.formData.hearingDetails?.hearingDate),
    locationId: pageData.formData.hearingDetails?.locationId,
  }
  return res.render(`pages/adjudicationTabbedParent/scheduleHearing`, {
    errors: error ? [error] : [],
    locations: pageData.displayData.possibleLocations,
    data,
  })
}

const extractValuesFromPost = (req: Request): SubmittedFormData => {
  const values = {
    hearingDetails: {
      hearingDate: req.body.hearingDate,
      locationId: req.body.locationId,
    },
  }
  return values
}

const getHearingDate = (userProvidedValue?: SubmittedDateTime) => {
  if (userProvidedValue) {
    const {
      date,
      time: { hour, minute },
    } = userProvidedValue
    return { date, hour, minute }
  }
  return null
}
