import { Request, Response } from 'express'
import PaybackPunishmentDurationPage, { PageRequestType } from './paybackPunishmentDurationPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class PaybackPunishmentDurationRoute {
  page: PaybackPunishmentDurationPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.page = new PaybackPunishmentDurationPage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
