import { Request, Response } from 'express'
import IsThereRehabilitativeActivitiesPage from './isThereRehabilitativeActivityPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class isThereRehabilitativeActivitiesRoutes {
  page: IsThereRehabilitativeActivitiesPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.page = new IsThereRehabilitativeActivitiesPage(userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
