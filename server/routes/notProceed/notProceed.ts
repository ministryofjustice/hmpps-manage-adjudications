import { Request, Response } from 'express'
import OutcomesService from '../../services/outcomesService'
import UserService from '../../services/userService'
import NotProceedPage from './notProceedPage'

export default class NotProceedRoutes {
  page: NotProceedPage

  constructor(userService: UserService, outcomesService: OutcomesService) {
    this.page = new NotProceedPage(userService, outcomesService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
