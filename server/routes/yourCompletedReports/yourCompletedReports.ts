import { Request, Response } from 'express'
import moment from 'moment'
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
import { datePickerDateToMoment, momentDateToDatePicker } from '../../utils/utils'

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
      filter: {
        fromDate: momentDateToDatePicker(filter.fromDate),
        toDate: momentDateToDatePicker(filter.toDate),
        status: filter.status,
      },
      statuses: reportedAdjudicationStatuses,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const filter = {
      fromDate: (req.query.fromDate && datePickerDateToMoment(req.query.fromDate as string)) || moment(),
      toDate: (req.query.toDate && datePickerDateToMoment(req.query.toDate as string)) || moment(),
      status: (req.query.status as ReportedAdjudicationStatus) || null,
    }
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
