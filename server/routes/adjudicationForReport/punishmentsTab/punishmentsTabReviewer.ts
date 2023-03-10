import { Request, Response } from 'express'
import OutcomesService from '../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import PunishmentsTabPage, { PageRequestType } from './punishmentsTabPage'

export default class PunishmentTabRoute {
  page: PunishmentsTabPage

  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService,
    private readonly outcomesService: OutcomesService
  ) {
    this.page = new PunishmentsTabPage(PageRequestType.REVIEWER, reportedAdjudicationsService, outcomesService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return this.page.view(req, res)
  }
}
