import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { formatDateForDatePicker } from '../../utils/utils'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  adjudicationHistoryFilterFromUiFilter,
  AdjudicationHistoryUiFilter,
  reportedAdjudicationStatuses,
  uiAdjudicationHistoryFilterFromRequest,
  UiFilter,
  uiFilterFromBody,
  validate,
} from '../../utils/adjudicationFilterHelper'
import { FormError } from '../../@types/template'

export default class AdjudicationHistoryRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: AdjudicationHistoryUiFilter,
    results: ApiPageResponse<ReportedAdjudication>,
    errors: FormError[]
  ): Promise<void> =>
    res.render(`pages/adjudicationHistory.njk`, {
      adjudications: results,
      filter,
      checkboxes: reportedAdjudicationStatuses(filter),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
      maxDate: formatDateForDatePicker(new Date().toISOString(), 'short'),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params
    const uiFilter = uiAdjudicationHistoryFilterFromRequest(req)
    const filter = adjudicationHistoryFilterFromUiFilter(uiFilter)

    const results = await this.reportedAdjudicationsService.getAdjudicationHistory(
      prisonerNumber,
      filter,
      pageRequestFrom(20, +req.query.pageNumber || 1),
      res.locals.user
    )

    return this.renderView(req, res, uiFilter, results, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    // const uiFilter = uiFilterFromBody(req)
    // const errors = validate(uiFilter)
    // if (errors && errors.length !== 0) {
    //   return this.renderView(req, res, ...uiFilter, { size: 20, number: 0, totalElements: 0, content: [] }, errors)
    // }
    // return res.redirect(adjudicationUrls.adjudicationHistory.urls.filter(uiFilter))
    return null
  }
}
