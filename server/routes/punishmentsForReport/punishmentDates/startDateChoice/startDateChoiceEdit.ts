import { Request, Response } from 'express'
import PunishmentStartDateChoicePage, { PageRequestType } from './startDateChoicePage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class PunishmentStartDateChoiceEditRoute {
  page: PunishmentStartDateChoicePage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.page = new PunishmentStartDateChoicePage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
