import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import NextStepsGovPage from './nextStepsGovPage'

export default class NextStepsInadRoutes {
  page: NextStepsGovPage

  constructor(userService: UserService) {
    this.page = new NextStepsGovPage(userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
