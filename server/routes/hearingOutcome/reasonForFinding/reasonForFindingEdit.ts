import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import ReasonForFindingPage, { PageRequestType } from './reasonForFindingPage'

export default class ReasonForFindingEditRoutes {
  page: ReasonForFindingPage

  constructor(
    reportedAdjudicationsService: ReportedAdjudicationsService,
    hearingsService: HearingsService,
    userService: UserService,
  ) {
    this.page = new ReasonForFindingPage(
      PageRequestType.EDIT,
      reportedAdjudicationsService,
      hearingsService,
      userService,
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
