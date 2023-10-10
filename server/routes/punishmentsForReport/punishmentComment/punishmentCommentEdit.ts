import { Request, Response } from 'express'
import PunishmentCommentPage, { PageRequestType } from './punishmentCommentPage'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'

export default class PunishmentCommentEditRoute {
  page: PunishmentCommentPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new PunishmentCommentPage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
