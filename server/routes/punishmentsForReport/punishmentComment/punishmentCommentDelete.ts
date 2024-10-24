import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import ConfirmDeletionPage from './punishmentCommentDeletePage'

export default class PunishmentCommentDeleteRoute {
  page: ConfirmDeletionPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.page = new ConfirmDeletionPage(userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
