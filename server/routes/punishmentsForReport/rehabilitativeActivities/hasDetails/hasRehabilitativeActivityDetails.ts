import { Request, Response } from 'express'
import HasRehabilitativeActivitiesDetailsPage from './hasRehabilitativeActivityDetailsPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class HasRehabilitativeActivitiesDetailsRoutes {
  page: HasRehabilitativeActivitiesDetailsPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.page = new HasRehabilitativeActivitiesDetailsPage(userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
