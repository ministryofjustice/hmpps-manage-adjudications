import { Request, Response } from 'express'
import WillPunishmentBeConsecutivePage, { PageRequestType } from './willPunishmentBeConsecutivePage'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'

export default class WillPunishmentBeConsecutiveEditRoute {
  page: WillPunishmentBeConsecutivePage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new WillPunishmentBeConsecutivePage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
