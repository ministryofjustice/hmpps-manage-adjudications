import { Request, Response } from 'express'
import OutcomesService from '../../../services/outcomesService'
import UserService from '../../../services/userService'
import NextStepsPolicePage from './nextStepsPolicePage'

export default class NextStepsPoliceRoutes {
  page: NextStepsPolicePage

  constructor(userService: UserService, outcomesService: OutcomesService) {
    this.page = new NextStepsPolicePage(userService, outcomesService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
