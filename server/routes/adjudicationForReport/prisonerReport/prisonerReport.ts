import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../../services/decisionTreeService'
import PrisonerReportPage, { PageRequestType } from './prisonerReportPage'

export default class prisonerReportRoutes {
  page: PrisonerReportPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.page = new PrisonerReportPage(PageRequestType.REPORTER, reportedAdjudicationsService, decisionTreeService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
