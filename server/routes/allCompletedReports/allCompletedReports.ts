import { Request, Response } from 'express'
import { pageRequestFrom, PageResponse } from '../../utils/pageResponse'
import mojPaginationFromPageResponse from '../../utils/pagination'
import { hasAnyRole } from '../../utils/utils'
import { ReportedAdjudicationEnhanced } from '../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    results: PageResponse<ReportedAdjudicationEnhanced>
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
      return res.render('pages/notFound.njk', { url: req.headers.referer || `/place-a-prisoner-on-report` })
    }
    const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
      res.locals.user,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )

    return this.renderView(req, res, results)
  }
}
