import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import CompleteRehabilitativeActivityPage from './completeRehabilitativeActivityPage'
import PunishmentsService from '../../../../services/punishmentsService'

export default class CompleteRehabilitativeActivityRoutes {
  page: CompleteRehabilitativeActivityPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new CompleteRehabilitativeActivityPage(userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
