import { Request, Response } from 'express'
import OutcomesService from '../../../services/outcomesService'
import UserService from '../../../services/userService'
import ProsecutionPage from './prosecutionPage'

export default class ProsecutionRoutes {
  page: ProsecutionPage

  constructor(userService: UserService, outcomesService: OutcomesService) {
    this.page = new ProsecutionPage(userService, outcomesService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
