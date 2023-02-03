import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import HearingAdjournPage, { PageRequestType } from './hearingAdjournPage'

export default class HearingAdjournEditRoutes {
  page: HearingAdjournPage

  constructor(hearingsService: HearingsService, userService: UserService) {
    this.page = new HearingAdjournPage(PageRequestType.EDIT, hearingsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
