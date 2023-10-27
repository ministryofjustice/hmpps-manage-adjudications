import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  fillInDefaults,
  filterFromUiFilter,
  reportedAdjudicationStatuses,
  UiFilter,
  uiFilterFromBody,
  uiFilterFromRequest,
  validate,
} from '../../utils/adjudicationFilterHelper'
import { FormError } from '../../@types/template'
import { formatDateForDatePicker } from '../../utils/utils'

export default class YourCompletedReportsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    uiFilter: UiFilter,
    results: ApiPageResponse<ReportedAdjudication>,
    errors: FormError[]
  ): Promise<void> => {
    return res.render(`pages/yourCompletedReports`, {
      yourCompletedReports: results,
      filter: uiFilter,
      checkboxes: reportedAdjudicationStatuses(uiFilter),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
      maxDate: formatDateForDatePicker(new Date().toISOString(), 'short'),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = fillInDefaults(uiFilterFromRequest(req))
    const filter = filterFromUiFilter(uiFilter)
    const results = await this.reportedAdjudicationsService.getYourCompletedAdjudications(
      res.locals.user,
      filter,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )
    return this.renderView(req, res, uiFilter, results, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = uiFilterFromBody(req)
    const errors = validate(uiFilter)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, uiFilter, { size: 20, number: 0, totalElements: 0, content: [] }, errors)
    }
    return res.redirect(adjudicationUrls.yourCompletedReports.urls.filter(uiFilter))
  }
}
