import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import DamagesOwedPage, { PageRequestType } from './damagesOwedPage'

export default class DamagesOwedRoutes {
  page: DamagesOwedPage

  constructor(reportedAdjudicationService: ReportedAdjudicationsService, userService: UserService) {
    this.page = new DamagesOwedPage(PageRequestType.CREATION, reportedAdjudicationService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
