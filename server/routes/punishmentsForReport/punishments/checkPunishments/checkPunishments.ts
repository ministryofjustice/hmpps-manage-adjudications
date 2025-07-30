import { Request, Response } from 'express'
import PunishmentsService from '../../../../services/punishmentsService'
import CheckPunishmentsPage, { PageRequestType } from './checkPunishmentsPage'
import UserService from '../../../../services/userService'

export default class CheckPunishmentsRoutes {
  page: CheckPunishmentsPage

  constructor(
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService,
  ) {
    this.page = new CheckPunishmentsPage(PageRequestType.CREATION, punishmentsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
