import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { hasAnyRole } from '../../utils/utils'
import {
  ReportedAdjudicationEnhanced,
  ReportedAdjudicationFilter,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatuses,
} from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  reportedAdjudicationFilterFromRequestParameters,
  uiFilterFromReportedAdjudicationFilter,
} from '../../utils/adjudicationFilterHelper'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: ReportedAdjudicationFilter,
    results: ApiPageResponse<ReportedAdjudicationEnhanced>
  ): Promise<void> =>
    res.render(`pages/allCompletedReports`, {
      allCompletedReports: results,
      filter: uiFilterFromReportedAdjudicationFilter(filter),
      statuses: reportedAdjudicationStatuses,
      query: encodeURIComponent(req.originalUrl),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const filter = reportedAdjudicationFilterFromRequestParameters(req)
      const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
        res.locals.user,
        filter,
        pageRequestFrom(20, +req.query.pageNumber || 1)
      )
      return this.renderView(req, res, filter, results)
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () =>
      res.redirect(
        adjudicationUrls.allCompletedReports.urls.filter(
          req.body.fromDate.date,
          req.body.toDate.date,
          req.body.status as ReportedAdjudicationStatus
        )
      )
    )
  }

  private validateRoles = async (req: Request, res: Response, thenCall: () => Promise<void>) => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return thenCall()
  }
}
