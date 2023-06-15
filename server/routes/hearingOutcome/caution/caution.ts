import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import CautionPage, { PageRequestType } from './cautionPage'

export default class CautionRoutes {
  page: CautionPage

  constructor(reportedAdjudicationsService: ReportedAdjudicationsService, userService: UserService) {
    this.page = new CautionPage(PageRequestType.CREATION, reportedAdjudicationsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
