/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './scheduleHearingValidation'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { FormError, SubmittedDateTime } from '../../../@types/template'
import { PrisonLocation } from '../../../data/PrisonLocationResult'
import { User } from '../../../data/hmppsManageUsersClient'
import logger from '../../../../logger'
import {
  convertDateTimeStringToSubmittedDateTime,
  convertSubmittedDateTimeToDateObject,
  formatDate,
} from '../../../utils/utils'
import { OicHearingType } from '../../../data/ReportedAdjudicationResult'

type InitialFormData = {
  hearingDetails?: HearingDetails
}

type SubmittedFormData = InitialFormData

type DisplayDataFromApis = {
  possibleLocations: PrisonLocation[]
  chargeNumber: string
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
  hearingType: string
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
    const { chargeNumber } = req.params
    const hearingId = Number(req.params.hearingId) // Only present if we're on the edit page

    let readApiHearingDetails: HearingDetails = null
    if (this.pageOptions.isEdit()) {
      readApiHearingDetails = await this.readFromApi(chargeNumber, hearingId, user as User)
    }
    const pageData = await this.getPageDataOnGet(chargeNumber, readApiHearingDetails, user)
    renderData(res, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const postValues = extractValuesFromPost(req)
    const { chargeNumber } = req.params
    const hearingId = Number(req.params.hearingId) // Only present if we're on the edit page
    const { dateTimeOfHearing } = await this.reportedAdjudicationsService.getLatestHearing(chargeNumber, user)
    const validationError = validateForm({
      hearingDate: postValues.hearingDetails.hearingDate,
      locationId: postValues.hearingDetails.locationId,
      hearingType: postValues.hearingDetails.hearingType,
      latestExistingHearing: dateTimeOfHearing,
    })
    if (validationError) {
      const pageData = await this.getPageDataOnGet(chargeNumber, postValues.hearingDetails, user)
      return renderData(res, pageData, validationError)
    }
    const hearingDetailsToSave = postValues.hearingDetails
    try {
      const isYOI = await this.getYoiInfo(chargeNumber, user)
      if (this.pageOptions.isEdit()) {
        await this.reportedAdjudicationsService.rescheduleHearing(
          chargeNumber,
          hearingDetailsToSave.locationId,
          formatDate(hearingDetailsToSave.hearingDate),
          getOICHearingType(hearingDetailsToSave.hearingType, isYOI),
          user
        )
      } else {
        await this.reportedAdjudicationsService.scheduleHearing(
          chargeNumber,
          hearingDetailsToSave.locationId,
          formatDate(hearingDetailsToSave.hearingDate),
          getOICHearingType(hearingDetailsToSave.hearingType, isYOI),
          user
        )
      }

      return res.redirect(adjudicationUrls.hearingDetails.urls.review(chargeNumber))
    } catch (postError) {
      if (this.pageOptions.isEdit()) {
        logger.error(`Failed to amend hearing: ${postError}`)
        res.locals.redirectUrl = adjudicationUrls.scheduleHearing.urls.edit(chargeNumber, hearingId)
      } else {
        logger.error(`Failed to schedule hearing: ${postError}`)
        res.locals.redirectUrl = adjudicationUrls.scheduleHearing.urls.start(chargeNumber)
      }
      throw postError
    }
  }

  readFromApi = async (chargeNumber: string, hearingId: number, user: User): Promise<HearingDetails> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    const [hearingToRender] = reportedAdjudication.hearings.filter(hearing => hearing.id === hearingId)
    return {
      hearingDate: await convertDateTimeStringToSubmittedDateTime(hearingToRender.dateTimeOfHearing),
      locationId: hearingToRender.locationId,
      id: hearingToRender.id,
      hearingType: getRadioHearingType(hearingToRender.oicHearingType),
    }
  }

  getPageDataOnGet = async (chargeNumber: string, hearingDetails: HearingDetails, user: User): Promise<PageData> => {
    return {
      displayData: await this.getDisplayData(chargeNumber, user),
      formData: {
        hearingDetails,
      },
    }
  }

  getDisplayData = async (chargeNumber: string, user: User): Promise<DisplayDataFromApis> => {
    const possibleLocations = await this.locationService.getHearingLocations(user.activeCaseLoadId, user)
    return {
      possibleLocations,
      chargeNumber,
    }
  }

  getYoiInfo = async (chargeNumber: string, user: User): Promise<boolean> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    return reportedAdjudication.isYouthOffender
  }
}

const renderData = (res: Response, pageData: PageData, error: FormError[]) => {
  const data = {
    hearingDate: convertSubmittedDateTimeToDateObject(pageData.formData.hearingDetails?.hearingDate),
    locationId: pageData.formData.hearingDetails?.locationId,
    hearingType: pageData.formData.hearingDetails?.hearingType,
  }

  return res.render(`pages/adjudicationForReport/scheduleHearing`, {
    errors: error || [],
    cancelHref: adjudicationUrls.hearingDetails.urls.review(pageData.displayData.chargeNumber),
    locations: pageData.displayData.possibleLocations,
    data,
  })
}

const extractValuesFromPost = (req: Request): SubmittedFormData => {
  const values = {
    hearingDetails: {
      hearingDate: req.body.hearingDate,
      locationId: req.body.locationId,
      hearingType: req.body.hearingType,
    },
  }
  return values
}

const getOICHearingType = (hearingType: string, YOI: boolean): OicHearingType => {
  const govAdj = hearingType === 'GOV'
  if (YOI) {
    return govAdj ? OicHearingType.GOV_YOI : OicHearingType.INAD_YOI
  }
  return govAdj ? OicHearingType.GOV_ADULT : OicHearingType.INAD_ADULT
}

const getRadioHearingType = (hearingType: string): string => {
  if ([OicHearingType.GOV_YOI as string, OicHearingType.GOV_ADULT as string].includes(hearingType)) return 'GOV'
  return 'IND_ADJ'
}
