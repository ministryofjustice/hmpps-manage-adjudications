import { Request, Response } from 'express'
import OutcomesService from '../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import PunishmentsTabPage, { PageRequestType } from './punishmentsTabPage'

export default class PunishmentTabRoute {
  page: PunishmentsTabPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly outcomesService: OutcomesService
  ) {
    this.page = new PunishmentsTabPage(PageRequestType.REPORTER, reportedAdjudicationsService, outcomesService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
