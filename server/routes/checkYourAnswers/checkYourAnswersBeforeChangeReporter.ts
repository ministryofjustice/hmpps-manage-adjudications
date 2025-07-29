import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import CheckYourAnswersPage, { PageRequestType } from './checkYourAnswersPage'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default class CheckYourAnswersReporterRoutes {
  page: CheckYourAnswersPage

  constructor(
    placeOnReportService: PlaceOnReportService,
    locationService: LocationService,
    decisionTreeService: DecisionTreeService,
    reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.page = new CheckYourAnswersPage(
      PageRequestType.EDIT_REPORTER,
      placeOnReportService,
      locationService,
      decisionTreeService,
      reportedAdjudicationsService,
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
