/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { FormError, SubmittedDateTime } from '../../../@types/template'
import { User } from '../../../data/hmppsAuthClient'

type PageData = {
  errors?: FormError[]
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
    private readonly userServicce: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData, error: FormError): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user)
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    // eslint-disable-next-line prefer-const
    let readApiHearingDetails: HearingDetails = null
    // if (this.pageOptions.isEdit()) {
    //   readApiHearingDetails = await this.readFromApi(req.params.hearingId, user as User)
    // }

    const data = {
      hearingDate: getHearingDate(readApiHearingDetails.hearingDate),
      locationId: readApiHearingDetails.locationId,
    }
    return res.render(`pages/adjudicationTabbedParent/scheduleHearing`, {
      errors: error ? [error] : [],
      locations,
      data,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {}, null)

  submit = async (req: Request, res: Response): Promise<void> => {
    const { locationId, hearingDate } = req.body
    console.log(locationId, hearingDate)
    // const adjudicationNumber = Number(req.params.adjudicationNumber)
    // return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
  }

  // readFromApi = async (adjudicationNumber: number, hearingId: number, user: User): Promise<HearingDetails> => {
  //   const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
  //     adjudicationNumber,
  //     user
  //   )
  // filter through hearings to find the correct hearingId and return details
  // }
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
