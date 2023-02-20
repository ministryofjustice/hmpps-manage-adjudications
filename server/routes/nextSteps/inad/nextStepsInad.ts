import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import NextStepsInadPage from './nextStepsInadPage'

export default class NextStepsInadRoutes {
  page: NextStepsInadPage

  constructor(userService: UserService) {
    this.page = new NextStepsInadPage(userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
