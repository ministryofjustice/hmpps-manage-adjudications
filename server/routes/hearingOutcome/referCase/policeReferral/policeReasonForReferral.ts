import { Request, Response } from 'express'
import OutcomesService from '../../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import UserService from '../../../../services/userService'
import PoliceReasonForReferralPage, { PageRequestType } from './policeReasonForReferralPage'

export default class PoliceReasonForReferralRoutes {
  page: PoliceReasonForReferralPage

  constructor(
    outcomesService: OutcomesService,
    userService: UserService,
    reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.page = new PoliceReasonForReferralPage(
      PageRequestType.CREATION,
      outcomesService,
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
