import { Request, Response } from 'express'
import PunishmentCommentPage, { PageRequestType } from './punishmentCommentPage'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'

export default class PunishmentCommentRoute {
  page: PunishmentCommentPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new PunishmentCommentPage(PageRequestType.CREATION, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
