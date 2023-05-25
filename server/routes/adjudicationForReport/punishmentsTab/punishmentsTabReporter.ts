import { Request, Response } from 'express'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import PunishmentsTabPage, { PageRequestType } from './punishmentsTabPage'
import UserService from '../../../services/userService'

export default class PunishmentTabRoute {
  page: PunishmentsTabPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.page = new PunishmentsTabPage(PageRequestType.REPORTER, reportedAdjudicationsService, punishmentsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
