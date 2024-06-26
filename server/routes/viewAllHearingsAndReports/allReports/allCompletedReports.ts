import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../../utils/mojPagination/pagination'
import { formatDateForDatePicker, hasAnyRole } from '../../../utils/utils'
import { ReportedAdjudicationEnhanced } from '../../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../../data/ApiData'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import {
  fillInDefaults,
  filterFromUiFilter,
  reportedAdjudicationStatuses,
  UiFilter,
  uiFilterFromBody,
  uiFilterFromRequest,
  validate,
} from '../../../utils/adjudicationFilterHelper'
import { FormError } from '../../../@types/template'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: UiFilter,
    results: ApiPageResponse<ReportedAdjudicationEnhanced>,
    errors: FormError[]
  ): Promise<void> =>
    res.render(`pages/viewAllHearingsAndReports/allReports`, {
      results,
      filter,
      statuses: reportedAdjudicationStatuses(filter),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
      maxDate: formatDateForDatePicker(new Date().toISOString(), 'short'),
      activeCaseloadName: res.locals.user.meta.description || 'your active caseload',
      clearHref: adjudicationUrls.allCompletedReports.urls.start(),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const uiFilter = fillInDefaults(uiFilterFromRequest(req))
      const filter = filterFromUiFilter(uiFilter)
      const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
        res.locals.user,
        { ...filter },
        pageRequestFrom(20, +req.query.pageNumber || 1)
      )
      return this.renderView(req, res, uiFilter, results, [])
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const uiFilter = uiFilterFromBody(req)
      const errors = validate(uiFilter)
      if (errors && errors.length !== 0) {
        return this.renderView(
          req,
          res,
          { ...uiFilter },
          { size: 20, number: 0, totalElements: 0, content: [] },
          errors
        )
      }
      return res.redirect(adjudicationUrls.allCompletedReports.urls.filter(uiFilter))
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
