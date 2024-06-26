import { Request, Response } from 'express'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import PunishmentsTabPage, { PageRequestType } from './punishmentsTabPage'
import UserService from '../../../services/userService'

export default class PunishmentTabViewRoute {
  page: PunishmentsTabPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService
  ) {
    this.page = new PunishmentsTabPage(
      PageRequestType.VIEW,
      reportedAdjudicationsService,
      punishmentsService,
      userService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
