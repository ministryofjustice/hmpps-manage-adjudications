import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import DamagesOwedPage, { PageRequestType } from './damagesOwedPage'

export default class DamagesOwedEditRoutes {
  page: DamagesOwedPage

  constructor(reportedAdjudicationService: ReportedAdjudicationsService, userService: UserService) {
    this.page = new DamagesOwedPage(PageRequestType.EDIT, reportedAdjudicationService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
