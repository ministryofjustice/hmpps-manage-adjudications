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
import logger from '../../../../logger'
import {
  convertDateTimeStringToSubmittedDateTime,
  convertSubmittedDateTimeToDateObject,
  formatDate,
} from '../../../utils/utils'

type InitialFormData = {
  hearingDetails?: HearingDetails
}

type SubmittedFormData = InitialFormData

type DisplayDataFromApis = {
  possibleLocations: PrisonLocation[]
  adjudicationNumber: number
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
    const hearingId = Number(req.params.hearingId) // Only present if we're on the edit page

    let readApiHearingDetails: HearingDetails = null
    if (this.pageOptions.isEdit()) {
      readApiHearingDetails = await this.readFromApi(adjudicationNumber, hearingId, user as User)
    }
    const pageData = await this.getPageDataOnGet(adjudicationNumber, readApiHearingDetails, user)
    renderData(res, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const postValues = extractValuesFromPost(req)
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const hearingId = Number(req.params.hearingId) // Only present if we're on the edit page
    const validationError = validateForm({
      hearingDate: postValues.hearingDetails.hearingDate,
      locationId: postValues.hearingDetails.locationId,
    })
    if (validationError) {
      const pageData = await this.getPageDataOnGet(adjudicationNumber, postValues.hearingDetails, user)
      return renderData(res, pageData, validationError)
    }
    const hearingDetailsToSave = postValues.hearingDetails
    try {
      if (this.pageOptions.isEdit()) {
        await this.reportedAdjudicationsService.rescheduleHearing(
          adjudicationNumber,
          hearingId,
          hearingDetailsToSave.locationId,
          formatDate(hearingDetailsToSave.hearingDate),
          'GOV_ADULT', // This is just hardcoded to fit the API requirments until the follow-up ticket can be done
          user
        )
      } else {
        await this.reportedAdjudicationsService.scheduleHearing(
          adjudicationNumber,
          hearingDetailsToSave.locationId,
          formatDate(hearingDetailsToSave.hearingDate),
          'GOV_ADULT', // This is just hardcoded to fit the API requirments until the follow-up ticket can be done
          user
        )
      }
      return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
    } catch (postError) {
      if (this.pageOptions.isEdit()) {
        logger.error(`Failed to amend hearing: ${postError}`)
        res.locals.redirectUrl = adjudicationUrls.scheduleHearing.urls.edit(adjudicationNumber, hearingId)
      } else {
        logger.error(`Failed to schedule hearing: ${postError}`)
        res.locals.redirectUrl = adjudicationUrls.scheduleHearing.urls.start(adjudicationNumber)
      }
      throw postError
    }
  }

  readFromApi = async (adjudicationNumber: number, hearingId: number, user: User): Promise<HearingDetails> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )
    const { reportedAdjudication } = adjudication
    const [hearingToRender] = reportedAdjudication.hearings.filter(hearing => hearing.id === hearingId)
    return {
      hearingDate: await convertDateTimeStringToSubmittedDateTime(hearingToRender.dateTimeOfHearing),
      locationId: hearingToRender.locationId,
      id: hearingToRender.id,
    }
  }

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
      possibleLocations,
      adjudicationNumber,
    }
  }
}

const renderData = (res: Response, pageData: PageData, error: FormError) => {
  const data = {
    hearingDate: convertSubmittedDateTimeToDateObject(pageData.formData.hearingDetails?.hearingDate),
    locationId: pageData.formData.hearingDetails?.locationId,
  }

  return res.render(`pages/adjudicationTabbedParent/scheduleHearing`, {
    errors: error ? [error] : [],
    cancelHref: adjudicationUrls.hearingDetails.urls.review(pageData.displayData.adjudicationNumber),
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