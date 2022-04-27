import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { hasAnyRole } from '../../utils/utils'
import { ReportedAdjudicationEnhanced, reportedAdjudicationStatuses } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  filterFromUiFilter,
  UiFilter,
  uiFilterFromBody,
  uiFilterFromRequest,
} from '../../utils/adjudicationFilterHelper'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: UiFilter,
    results: ApiPageResponse<ReportedAdjudicationEnhanced>
  ): Promise<void> =>
    res.render(`pages/allCompletedReports`, {
      allCompletedReports: results,
      filter,
      statuses: reportedAdjudicationStatuses,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const uiFilter = uiFilterFromRequest(req)
      const filter = filterFromUiFilter(uiFilter)
      const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
        res.locals.user,
        filter,
        pageRequestFrom(20, +req.query.pageNumber || 1)
      )
      return this.renderView(req, res, uiFilter, results)
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const uiFilter = uiFilterFromBody(req)
      return res.redirect(adjudicationUrls.allCompletedReports.urls.filter(uiFilter))
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
