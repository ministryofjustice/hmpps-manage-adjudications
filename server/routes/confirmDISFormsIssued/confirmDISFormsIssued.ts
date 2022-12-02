import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import { FormError } from '../../@types/template'
import {
  DISFormfilterFromUiFilter,
  DISUiFilter,
  fillInDISFormFilterDefaults,
  uiDISFormFilterFromRequest,
} from '../../utils/adjudicationFilterHelper'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { ReportedAdjudicationEnhancedWithIssuingDetails } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: DISUiFilter,
    results: ApiPageResponse<ReportedAdjudicationEnhancedWithIssuingDetails>,
    errors: FormError[]
  ): Promise<void> =>
    res.render(`pages/confirmDISFormsIssued`, {
      reports: results,
      filter,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = fillInDISFormFilterDefaults(uiDISFormFilterFromRequest(req))
    const filter = DISFormfilterFromUiFilter(uiFilter)
    const results = await this.reportedAdjudicationsService.getAdjudicationDISFormData(
      res.locals.user,
      filter,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )
    return this.renderView(req, res, uiFilter, results, [])
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  submit = async (req: Request, res: Response): Promise<void> => {}
}
