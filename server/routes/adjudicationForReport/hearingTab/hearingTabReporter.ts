import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingTabPage, { PageRequestType } from './hearingTabPage'

export default class HearingTabRoute {
  page: HearingTabPage

  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {
    this.page = new HearingTabPage(PageRequestType.REPORTER, reportedAdjudicationsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
