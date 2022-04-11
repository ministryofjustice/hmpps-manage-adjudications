import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { hasAnyRole } from '../../utils/utils'
import { ReportedAdjudicationEnhanced } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import { homepage } from '../../utils/urlGenerator'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    results: ApiPageResponse<ReportedAdjudicationEnhanced>
  ): Promise<void> =>
    res.render(`pages/allCompletedReports`, {
      allCompletedReports: results,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || homepage.root })
    }
    const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
      res.locals.user,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )

    return this.renderView(req, res, results)
  }
}
