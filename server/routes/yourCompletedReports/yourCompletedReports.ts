import { Request, Response } from 'express'
import url from 'url'
import moment from 'moment'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { ReportedAdjudication, ReportedAdjudicationFilter } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { displayName, ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationStatus'

const statuses = Object.keys(ReportedAdjudicationStatus).map(key => {
  return {
    key,
    value: displayName(key as ReportedAdjudicationStatus),
  }
})

type Filter = {
  fromDateString: string
  toDateString: string
} & ReportedAdjudicationFilter

export default class YourCompletedReportsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: Filter,
    results: ApiPageResponse<ReportedAdjudication>
  ): Promise<void> => {
    return res.render(`pages/yourCompletedReports`, {
      yourCompletedReports: results,
      filter,
      statuses,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const filter = this.filterFrom(req.query.fromDate as string, req.query.toDate as string, 'DD/MM/YYYY')
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
      query: { fromDate: req.body.fromDate.date, toDate: req.body.toDate.date },
    }
    return res.redirect(url.format(urlQuery))
  }

  private filterFrom(fromDateString: string, toDateString: string, format: string) {
    const fromDate = (fromDateString && moment(fromDateString, format)) || moment()
    const toDate = (toDateString && moment(toDateString, format)) || moment()
    return {
      fromDate,
      toDate,
      fromDateString: fromDate.format(format),
      toDateString: toDate.format(format),
    }
  }
}
