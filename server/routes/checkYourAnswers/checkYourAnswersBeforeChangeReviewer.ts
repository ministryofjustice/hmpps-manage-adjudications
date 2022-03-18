import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import CheckYourAnswersPage, { PageRequestType } from './checkYourAnswersPage'

export default class CheckYourAnswersReviewerRoutes {
  page: CheckYourAnswersPage

  constructor(
    placeOnReportService: PlaceOnReportService,
    locationService: LocationService,
    decisionTreeService: DecisionTreeService
  ) {
    this.page = new CheckYourAnswersPage(
      PageRequestType.EDIT_REVIEWER,
      placeOnReportService,
      locationService,
      decisionTreeService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
