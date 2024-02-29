import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../../utils/mojPagination/pagination'
import { hasAnyRole } from '../../../utils/utils'
import { ReportedAdjudicationEnhanced } from '../../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../../data/ApiData'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import {
  fillInTransfersDefaults,
  transferredAdjudicationStatuses,
  TransferredReportType,
  transfersFilterFromUiFilter,
  TransfersUiFilter,
  transfersUiFilterFromBody,
  uiTransfersFilterFromRequest,
} from '../../../utils/adjudicationFilterHelper'
import { FormError } from '../../../@types/template'

export default class ReportsTransferredInRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: TransfersUiFilter,
    results: ApiPageResponse<ReportedAdjudicationEnhanced>,
    errors: FormError[]
  ): Promise<void> => {
    return res.render(`pages/viewTransferredReports/reportsTransferredIn.njk`, {
      allCompletedReports: results,
      filter,
      checkboxes: transferredAdjudicationStatuses(filter),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const uiFilter = fillInTransfersDefaults(uiTransfersFilterFromRequest(req))
      const filter = transfersFilterFromUiFilter(uiFilter, TransferredReportType.IN)
      const results = await this.reportedAdjudicationsService.getTransferredAdjudicationReports(
        res.locals.user,
        filter,
        pageRequestFrom(20, +req.query.pageNumber || 1)
      )
      return this.renderView(req, res, uiFilter, results, [])
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const uiFilter = transfersUiFilterFromBody(req)
      const filter = transfersFilterFromUiFilter(uiFilter, TransferredReportType.IN)
      return res.redirect(adjudicationUrls.reportsTransferredIn.urls.filter(filter))
    })
  }

  private validateRoles = async (req: Request, res: Response, thenCall: () => Promise<void>) => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return thenCall()
  }
}
