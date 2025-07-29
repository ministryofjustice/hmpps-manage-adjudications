import { Request, Response } from 'express'
import OutcomesService from '../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import ReportAQuashedGuiltyFindingPage, { PageRequestType } from './reportAQuashedGuiltyFindingPage'

export default class ReportAQuashedGuiltyFindingRoutes {
  page: ReportAQuashedGuiltyFindingPage

  constructor(
    userService: UserService,
    outcomesService: OutcomesService,
    reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.page = new ReportAQuashedGuiltyFindingPage(
      PageRequestType.CREATION,
      userService,
      outcomesService,
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
