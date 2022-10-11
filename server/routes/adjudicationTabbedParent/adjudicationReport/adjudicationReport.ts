import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import DecisionTreeService from '../../../services/decisionTreeService'
import AdjudicationReportPage, { PageRequestType } from './adjudicationReportPage'

export default class prisonerReportRoutes {
  page: AdjudicationReportPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.page = new AdjudicationReportPage(
      PageRequestType.REPORTER,
      reportedAdjudicationsService,
      locationService,
      decisionTreeService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
