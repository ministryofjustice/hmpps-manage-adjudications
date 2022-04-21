import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import {
  ReportedAdjudication,
  ReportedAdjudicationFilter,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatuses,
} from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  reportedAdjudicationFilterFromRequestParameters,
  uiFilterFromReportedAdjudicationFilter,
} from '../../utils/adjudicationFilterHelper'

export default class YourCompletedReportsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: ReportedAdjudicationFilter,
    results: ApiPageResponse<ReportedAdjudication>
  ): Promise<void> => {
    return res.render(`pages/yourCompletedReports`, {
      yourCompletedReports: results,
      filter: uiFilterFromReportedAdjudicationFilter(filter),
      statuses: reportedAdjudicationStatuses,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const filter = reportedAdjudicationFilterFromRequestParameters(req)
    const results = await this.reportedAdjudicationsService.getYourCompletedAdjudications(
      res.locals.user,
      filter,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )
    return this.renderView(req, res, filter, results)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    return res.redirect(
      adjudicationUrls.yourCompletedReports.urls.filter(
        req.body.fromDate.date,
        req.body.toDate.date,
        req.body.status as ReportedAdjudicationStatus
      )
    )
  }
}
