import { Request, Response } from 'express'
import moment from 'moment'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { datePickerDateToMoment, hasAnyRole, momentDateToDatePicker } from '../../utils/utils'
import {
  ReportedAdjudicationEnhanced,
  ReportedAdjudicationFilter,
  ReportedAdjudicationStatus,
} from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

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
      filter: {
        fromDate: momentDateToDatePicker(filter.fromDate),
        toDate: momentDateToDatePicker(filter.toDate),
        status: filter.status,
      },
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    const filter = {
      fromDate: (req.query.fromDate && datePickerDateToMoment(req.query.fromDate as string)) || moment(),
      toDate: (req.query.toDate && datePickerDateToMoment(req.query.toDate as string)) || moment(),
      status: (req.query.status as ReportedAdjudicationStatus) || null,
    }
    const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
      res.locals.user,
      filter,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )

    return this.renderView(req, res, filter, results)
  }
}
