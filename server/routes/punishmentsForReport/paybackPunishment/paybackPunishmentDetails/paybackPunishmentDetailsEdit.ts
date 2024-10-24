import { Request, Response } from 'express'
import PaybackPunishmentDetailsPage, { PageRequestType } from './paybackPunishmentDetailsPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class PaybackPunishmentDetailsRoute {
  page: PaybackPunishmentDetailsPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.page = new PaybackPunishmentDetailsPage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
