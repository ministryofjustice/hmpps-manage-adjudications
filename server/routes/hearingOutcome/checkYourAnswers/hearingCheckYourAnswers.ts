import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingCheckYourAnswersPage, { PageRequestType } from './hearingCheckYourAnswersPage'

export default class HearingCheckYourAnswersRoutes {
  page: HearingCheckYourAnswersPage

  constructor(
    hearingsService: HearingsService,
    userService: UserService,
    reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.page = new HearingCheckYourAnswersPage(
      PageRequestType.CREATION,
      hearingsService,
      userService,
      reportedAdjudicationsService,
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
