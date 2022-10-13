import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingDetailsPage, { PageRequestType } from './hearingDetailsPage'

export default class HearingDetailsRoute {
  page: HearingDetailsPage

  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {
    this.page = new HearingDetailsPage(PageRequestType.REPORTER, reportedAdjudicationsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
