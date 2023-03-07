import { Request, Response } from 'express'
import HearingsService from '../../services/hearingsService'
import OutcomesService from '../../services/outcomesService'
import UserService from '../../services/userService'
import NotProceedPage, { PageRequestType } from './notProceedPage'

export default class NotProceedCompleteHearingRoutes {
  page: NotProceedPage

  constructor(userService: UserService, outcomesService: OutcomesService, hearingsService: HearingsService) {
    this.page = new NotProceedPage(PageRequestType.COMPLETE_HEARING, userService, outcomesService, hearingsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
