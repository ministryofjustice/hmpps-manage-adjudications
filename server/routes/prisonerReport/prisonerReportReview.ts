import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import PrisonerReportPage, { PageRequestType } from './prisonerReportPage'

import { hasAnyRole } from '../../utils/utils'
import { homepage } from '../../utils/urlGenerator'

export default class prisonerReportReviewRoutes {
  page: PrisonerReportPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.page = new PrisonerReportPage(
      PageRequestType.REVIEWER,
      reportedAdjudicationsService,
      locationService,
      userService,
      decisionTreeService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || homepage.root })
    }
    return this.page.view(req, res)
  }
}
