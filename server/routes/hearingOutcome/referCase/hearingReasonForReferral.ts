import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import HearingReasonForReferralPage, { PageRequestType } from './hearingReasonForReferralPage'

export default class HearingReasonForReferralRoutes {
  page: HearingReasonForReferralPage

  constructor(hearingsService: HearingsService, userService: UserService) {
    this.page = new HearingReasonForReferralPage(PageRequestType.CREATION, hearingsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}