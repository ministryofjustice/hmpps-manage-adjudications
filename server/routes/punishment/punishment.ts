import { Request, Response } from 'express'
import PunishmentPage, { PageRequestType } from './punishmentPage'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default class PunishmentRoute {
  page: PunishmentPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.page = new PunishmentPage(
      PageRequestType.CREATION,
      userService,
      punishmentsService,
      reportedAdjudicationsService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
