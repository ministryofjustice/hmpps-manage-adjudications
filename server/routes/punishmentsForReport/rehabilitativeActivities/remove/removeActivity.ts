import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import RemoveRehabilitativeActivityPage from './removeActivityPage'
import PunishmentsService from '../../../../services/punishmentsService'

export default class RemoveRehabilitativeActivityRoutes {
  page: RemoveRehabilitativeActivityPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.page = new RemoveRehabilitativeActivityPage(userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
