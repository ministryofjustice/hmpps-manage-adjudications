/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { FormError } from '../../../@types/template'

type PageData = {
  errors?: FormError[]
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

    return res.render(`pages/adjudicationTabbedParent/scheduleHearing`, {
      errors: error ? [error] : [],
      pageData,
      locations,
      data: {
        locationId: undefined,
        hearingDate: {
          date: undefined,
          hour: undefined,
          minute: undefined,
        },
      },
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {}, null)

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
  }
}
