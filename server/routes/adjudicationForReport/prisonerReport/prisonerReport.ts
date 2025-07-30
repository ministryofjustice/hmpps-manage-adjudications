import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../../services/decisionTreeService'
import PrisonerReportPage, { PageRequestType } from './prisonerReportPage'
import UserService from '../../../services/userService'

export default class prisonerReportRoutes {
  page: PrisonerReportPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly userService: UserService,
  ) {
    this.page = new PrisonerReportPage(
      PageRequestType.REPORTER,
      reportedAdjudicationsService,
      decisionTreeService,
      userService,
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
