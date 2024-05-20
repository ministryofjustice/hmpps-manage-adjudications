import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import RemoveRehabilitativeActivityPage from './removeActivityPage'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default class RemoveRehabilitativeActivityRoutes {
  page: RemoveRehabilitativeActivityPage

  constructor(
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.page = new RemoveRehabilitativeActivityPage(userService, reportedAdjudicationsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
