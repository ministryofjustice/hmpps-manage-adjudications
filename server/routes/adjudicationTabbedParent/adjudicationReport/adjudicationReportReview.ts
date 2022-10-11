import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import DecisionTreeService from '../../../services/decisionTreeService'
import AdjudicationReportPage, { PageRequestType } from './adjudicationReportPage'

import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'

export default class adjudicationReportReviewRoutes {
  page: AdjudicationReportPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.page = new AdjudicationReportPage(
      PageRequestType.REVIEWER,
      reportedAdjudicationsService,
      locationService,
      decisionTreeService
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
