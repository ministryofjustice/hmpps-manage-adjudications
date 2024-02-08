import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../../utils/mojPagination/pagination'
import { formatDateForDatePicker, hasAnyRole } from '../../../utils/utils'
import { ReportedAdjudicationEnhanced } from '../../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../../data/ApiData'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import {
  fillInTransfersDefaults,
  transferredAdjudicationStatuses,
  transfersFilterFromUiFilter,
  TransfersUiFilter,
  transfersUiFilterFromBody,
  uiTransfersFilterFromRequest,
} from '../../../utils/adjudicationFilterHelper'
import { FormError } from '../../../@types/template'

export default class AllTransferredReportsRoutes {
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
    return res.render(`pages/viewAllHearingsAndReports/allTransferredReports`, {
      allCompletedReports: results,
      filter,
      checkboxes: transferredAdjudicationStatuses(filter),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      viewScheduledHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      viewAllCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      viewTransferredReportsHref: adjudicationUrls.allTransferredReports.urls.start(),
      activeTab: 'viewTransferredReports',
      errors,
      maxDate: formatDateForDatePicker(new Date().toISOString(), 'short'),
      activeCaseloadName: res.locals.user.meta.description || 'your active caseload',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const uiFilter = fillInTransfersDefaults(uiTransfersFilterFromRequest(req))
      const filter = transfersFilterFromUiFilter(uiFilter)
      const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
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
      return res.redirect(adjudicationUrls.allTransferredReports.urls.filter(uiFilter))
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
