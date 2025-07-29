import { Request, Response } from 'express'
import OutcomesService from '../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingTabPage, { PageRequestType } from './hearingTabPage'
import UserService from '../../../services/userService'

export default class HearingTabRoute {
  page: HearingTabPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly outcomesService: OutcomesService,
    private readonly userService: UserService,
  ) {
    this.page = new HearingTabPage(PageRequestType.REPORTER, reportedAdjudicationsService, outcomesService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
