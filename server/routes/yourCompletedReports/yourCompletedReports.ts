import { Request, Response } from 'express'
import url from 'url'
import moment from 'moment'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { formatTimestampToDate } from '../../utils/utils'

type Filter = {
  fromDate: string
  toDate: string
}

export default class YourCompletedReportsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: Filter,
    results: ApiPageResponse<ReportedAdjudication>
  ): Promise<void> =>
    res.render(`pages/yourCompletedReports`, {
      yourCompletedReports: results,
      filter,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const filter = {
      fromDate: (req.query.fromDate || moment().format('DD/MM/YYYY')) as string,
      toDate: (req.query.toDate || moment().format('DD/MM/YYYY')) as string,
    }
    const results = await this.reportedAdjudicationsService.getYourCompletedAdjudications(
      res.locals.user,
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
}
