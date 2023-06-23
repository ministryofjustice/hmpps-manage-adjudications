import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../../services/decisionTreeService'
import PrisonerReportPage, { PageRequestType } from './prisonerReportPage'
import LocationService from '../../../services/locationService'

export default class prisonerReportViewRoutes {
  page: PrisonerReportPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly locationService: LocationService
  ) {
    this.page = new PrisonerReportPage(
      PageRequestType.VIEW,
      reportedAdjudicationsService,
      decisionTreeService,
      locationService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
