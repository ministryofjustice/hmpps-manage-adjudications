import { Request, Response } from 'express'
import IsThereRehabilitativeActivitiesPage from './isThereRehabilitativeActivityPage'
import UserService from '../../../../services/userService'

export default class isThereRehabilitativeActivitiesRoutes {
  page: IsThereRehabilitativeActivitiesPage

  constructor(private readonly userService: UserService) {
    this.page = new IsThereRehabilitativeActivitiesPage(userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
