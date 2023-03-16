import { Request, Response } from 'express'
import HearingsService from '../../services/hearingsService'
import OutcomesService from '../../services/outcomesService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import NotProceedPage, { PageRequestType } from './notProceedPage'

export default class NotProceedEditRoutes {
  page: NotProceedPage

  constructor(
    userService: UserService,
    outcomesService: OutcomesService,
    hearingsService: HearingsService,
    reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.page = new NotProceedPage(
      PageRequestType.REFER_AND_NO_HEARING_EDIT,
      userService,
      outcomesService,
      hearingsService,
      reportedAdjudicationsService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
