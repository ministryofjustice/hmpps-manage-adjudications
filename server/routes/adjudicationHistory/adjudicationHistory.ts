import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { formatDateForDatePicker, hasAnyRole } from '../../utils/utils'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  adjudicationHistoryFilterFromUiFilter,
  AdjudicationHistoryUiFilter,
  adjudicationHistoryUiFilterFromBody,
  establishmentCheckboxes,
  fillInAdjudicationHistoryDefaults,
  punishmentCheckboxes,
  reportedAdjudicationStatuses,
  uiAdjudicationHistoryFilterFromRequest,
  validate,
} from '../../utils/adjudicationFilterHelper'
import { EstablishmentInformation, FormError } from '../../@types/template'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'

export default class AdjudicationHistoryRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: AdjudicationHistoryUiFilter,
    results: ApiPageResponse<ReportedAdjudication>,
    errors: FormError[],
    prisoner: PrisonerResultSummary,
    uniqueListOfAgenciesForPrisoner: Array<EstablishmentInformation>,
    forbidden?: boolean
  ): Promise<void> => {
    res.render(`pages/adjudicationHistory.njk`, {
      prisonerNumber: req.params.prisonerNumber,
      prisoner,
      adjudications: results,
      filter,
      statuses: reportedAdjudicationStatuses(filter),
      establishments: establishmentCheckboxes(filter, uniqueListOfAgenciesForPrisoner),
      punishment: punishmentCheckboxes(filter),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
      maxDate: formatDateForDatePicker(new Date().toISOString(), 'short'),
      uniqueListOfAgenciesForPrisoner,
      forbidden,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const uiFilter = fillInAdjudicationHistoryDefaults(uiAdjudicationHistoryFilterFromRequest(req))
    const filter = adjudicationHistoryFilterFromUiFilter(uiFilter)
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(prisonerNumber, user)
    const activeCaseLoadId = user.meta.caseLoadId
    let forbidden = false

    if (prisoner.agencyId !== activeCaseLoadId) {
      const userRoles = await this.userService.getUserRoles(user.token)
      if (!hasAnyRole(['ADJUDICATIONS_REVIEWER', 'GLOBAL_SEARCH'], userRoles)) {
        forbidden = true
      }
    }

    const uniqueListOfAgenciesForPrisoner = await this.reportedAdjudicationsService.getUniqueListOfAgenciesForPrisoner(
      prisonerNumber,
      user
    )
    const results = await this.reportedAdjudicationsService.getAdjudicationHistory(
      prisoner,
      uniqueListOfAgenciesForPrisoner,
      filter,
      pageRequestFrom(20, +req.query.pageNumber || 1),
      res.locals.user
    )
    return this.renderView(req, res, uiFilter, results, [], prisoner, uniqueListOfAgenciesForPrisoner, forbidden)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const uiFilter = adjudicationHistoryUiFilterFromBody(req)
    const errors = validate(uiFilter)
    if (errors && errors.length !== 0) {
      const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(prisonerNumber, user)
      const uniqueListOfAgenciesForPrisoner =
        await this.reportedAdjudicationsService.getUniqueListOfAgenciesForPrisoner(prisonerNumber, user)
      return this.renderView(
        req,
        res,
        uiFilter,
        { size: 20, number: 0, totalElements: 0, content: [] },
        errors,
        prisoner,
        uniqueListOfAgenciesForPrisoner
      )
    }
    return res.redirect(adjudicationUrls.adjudicationHistory.urls.filter(prisonerNumber, uiFilter))
  }
}
