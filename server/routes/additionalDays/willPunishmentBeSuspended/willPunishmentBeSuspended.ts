import { Request, Response } from 'express'
import WillPunishmentBeSuspendedPage, { PageRequestType } from './willPunishmentBeSuspendedPage'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'

export default class willPunishmentBeSuspendedRoute {
  page: WillPunishmentBeSuspendedPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new WillPunishmentBeSuspendedPage(PageRequestType.CREATION, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
