import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import HearingCheckYourAnswersPage from './hearingCheckYourAnswersPage'

export default class HearingCheckYourAnswersRoutes {
  page: HearingCheckYourAnswersPage

  constructor(hearingsService: HearingsService, userService: UserService) {
    this.page = new HearingCheckYourAnswersPage(hearingsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
