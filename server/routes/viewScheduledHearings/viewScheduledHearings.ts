import { Request, Response } from 'express'
import { hasAnyRole } from '../../utils/utils'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { FormError } from '../../@types/template'
import LocationService from '../../services/locationService'

export default class viewScheduledHearingsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService
  ) {}

  private renderView = async (req: Request, res: Response, errors: FormError[]): Promise<void> =>
    res.render(`pages/viewScheduledHearings`, {
      errors,
    })

  view = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      return this.renderView(req, res, [])
    })
  }

  private validateRoles = async (req: Request, res: Response, thenCall: () => Promise<void>) => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return thenCall()
  }
}
