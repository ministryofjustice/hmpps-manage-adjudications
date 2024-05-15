import { Request, Response } from 'express'
import paybackPunishmentSpecificsPage, { PageRequestType } from './paybackPunishmentSpecificsPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class paybackPunishmentSpecificsRoute {
  page: paybackPunishmentSpecificsPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new paybackPunishmentSpecificsPage(PageRequestType.CREATION, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
