import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import UserService from '../../../../services/userService'
import GovReasonForReferralPage, { PageRequestType } from './govReasonForReferralPage'
import OutcomesService from '../../../../services/outcomesService'

export default class GovReasonForReferralEditRoutes {
  page: GovReasonForReferralPage

  constructor(
    userService: UserService,
    reportedAdjudicationsService: ReportedAdjudicationsService,
    outcomesService: OutcomesService
  ) {
    this.page = new GovReasonForReferralPage(
      PageRequestType.EDIT,
      userService,
      reportedAdjudicationsService,
      outcomesService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
