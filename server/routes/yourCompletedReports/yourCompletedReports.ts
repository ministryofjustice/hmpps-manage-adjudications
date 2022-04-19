import { Request, Response } from 'express'
import url from 'url'
import moment from 'moment'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import {
  ReportedAdjudication,
  ReportedAdjudicationFilter,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
} from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { datePickerDateToMoment, momentDateToDatePicker } from '../../utils/utils'

const statuses = Object.keys(ReportedAdjudicationStatus).map(key => {
  return {
    value: key,
    text: reportedAdjudicationStatusDisplayName(key as ReportedAdjudicationStatus),
  }
})

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
        fromDate: momentDateToDatePicker(filter.toDate),
        toDate: momentDateToDatePicker(filter.fromDate),
        status: filter.status,
      },
      statuses,
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
    const urlQuery = {
      pathname: adjudicationUrls.yourCompletedReports.root,
      query: {
        fromDate: req.body.fromDate.date,
        toDate: req.body.toDate.date,
        status: req.body.status as ReportedAdjudicationStatus,
      },
    }
    return res.redirect(url.format(urlQuery))
  }
}
