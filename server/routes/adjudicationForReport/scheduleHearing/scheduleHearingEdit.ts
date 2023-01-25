import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import ScheduleHearingPage, { PageRequestType } from './scheduleHearingPage'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'

export default class scheduleHearingRoutes {
  page: ScheduleHearingPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService
  ) {
    this.page = new ScheduleHearingPage(
      PageRequestType.EDIT,
      reportedAdjudicationsService,
      locationService,
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
