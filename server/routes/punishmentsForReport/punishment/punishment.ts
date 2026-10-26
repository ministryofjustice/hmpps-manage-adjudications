import { Request, Response } from 'express'
import PunishmentPage, { PageRequestType } from './punishmentPage'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../services/punishmentBatchSessionService'

export default class PunishmentRoute {
  page: PunishmentPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly punishmentBatchSessionService: PunishmentBatchSessionService,
  ) {
    this.page = new PunishmentPage(
      PageRequestType.CREATION,
      userService,
      punishmentsService,
      punishmentBatchSessionService,
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
