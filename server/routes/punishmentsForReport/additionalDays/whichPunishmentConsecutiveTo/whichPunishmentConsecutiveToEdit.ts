import { Request, Response } from 'express'
import WhichPunishmentConsecutiveToPage, { PageRequestType } from './whichPunishmentConsecutiveToPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class WhichPunishmentConsecutiveToRoute {
  page: WhichPunishmentConsecutiveToPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new WhichPunishmentConsecutiveToPage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
