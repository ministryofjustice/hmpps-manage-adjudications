import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import { ApiPageResponse } from '../../data/ApiData'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import PlaceOnReportService from '../../services/placeOnReportService'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  fillInDefaults,
  filterFromUiFilter,
  ContinueReportUiFilter,
  uiFilterFromBody,
  uiFilterFromRequest,
  validate,
} from './continueReportFilterHelper'

export default class ContinueReportSelectRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (
    req: Request,
    res: Response,
    uiFilter: ContinueReportUiFilter,
    results: ApiPageResponse<DraftAdjudication>,
    errors: FormError[]
  ): Promise<void> => {
    return res.render(`pages/continueReportSelect`, {
      reports: results,
      filter: uiFilter,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const uiFilter = fillInDefaults(uiFilterFromRequest(req))
    const filter = filterFromUiFilter(uiFilter)

    const results = await this.placeOnReportService.getAllDraftAdjudicationsForUser(
      user,
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
    return res.redirect(adjudicationUrls.continueReport.urls.filter(uiFilter))
  }
}
