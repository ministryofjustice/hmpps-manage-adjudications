import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import DecisionTreeService from '../../../services/decisionTreeService'
import PrisonerReportPage, { PageRequestType } from './prisonerReportPage'

import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import LocationService from '../../../services/locationService'

export default class prisonerReportReviewRoutes {
  page: PrisonerReportPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly locationService: LocationService
  ) {
    this.page = new PrisonerReportPage(
      PageRequestType.REVIEWER,
      reportedAdjudicationsService,
      decisionTreeService,
      userService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
