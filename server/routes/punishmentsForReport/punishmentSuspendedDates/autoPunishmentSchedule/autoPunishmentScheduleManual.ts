import { Request, Response } from 'express'
import AutoPunishmentSchedulePage, { PageRequestType } from './autoPunishmentSchedulePage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class AutoPunishmentScheduleRoute {
  page: AutoPunishmentSchedulePage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new AutoPunishmentSchedulePage(PageRequestType.MANUAL, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
