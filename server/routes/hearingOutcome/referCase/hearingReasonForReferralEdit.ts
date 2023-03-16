import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import HearingReasonForReferralPage, { PageRequestType } from './hearingReasonForReferralPage'

export default class HearingReasonForReferralEditRoutes {
  page: HearingReasonForReferralPage

  constructor(
    hearingsService: HearingsService,
    userService: UserService,
    reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.page = new HearingReasonForReferralPage(
      PageRequestType.EDIT,
      hearingsService,
      userService,
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
