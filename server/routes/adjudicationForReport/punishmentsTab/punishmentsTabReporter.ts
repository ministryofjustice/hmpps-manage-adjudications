import { Request, Response } from 'express'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import PunishmentsTabPage, { PageRequestType } from './punishmentsTabPage'

export default class PunishmentTabReporterRoute {
  page: PunishmentsTabPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.page = new PunishmentsTabPage(PageRequestType.REPORTER, reportedAdjudicationsService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
