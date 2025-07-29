import { Request, Response } from 'express'
import PaybackPunishmentCompletionDatePage, { PageRequestType } from './paybackPunishmentCompletionDatePage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class PaybackPunishmentCompletionDateEditRoute {
  page: PaybackPunishmentCompletionDatePage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.page = new PaybackPunishmentCompletionDatePage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
