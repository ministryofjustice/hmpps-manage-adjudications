import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import ConfirmCompleteRehabilitativeActivityPage from './confirmPage'
import PunishmentsService from '../../../../services/punishmentsService'

export default class ConfirmCompleteRehabilitativeActivityRoutes {
  page: ConfirmCompleteRehabilitativeActivityPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new ConfirmCompleteRehabilitativeActivityPage(userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
