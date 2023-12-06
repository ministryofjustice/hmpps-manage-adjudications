import { Request, Response } from 'express'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import { convertToTitleCase, formatDateForDatePicker } from '../../utils/utils'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ApiPageResponse } from '../../data/ApiData'
import adjudicationUrls from '../../utils/urlGenerator'
import {
  adjudicationHistoryFilterFromUiFilter,
  AdjudicationHistoryUiFilter,
  adjudicationHistoryUiFilterFromBody,
  establishmentCheckboxes,
  reportedAdjudicationStatuses,
  uiAdjudicationHistoryFilterFromRequest,
  validate,
} from '../../utils/adjudicationFilterHelper'
import { EstablishmentInformation, FormError } from '../../@types/template'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default class AdjudicationHistoryRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: AdjudicationHistoryUiFilter,
    results: ApiPageResponse<ReportedAdjudication>,
    errors: FormError[],
    prisonerName: string,
    breadcrumbName: string,
    uniqueListOfAgenciesForPrisoner: Array<EstablishmentInformation>
  ): Promise<void> => {
    res.render(`pages/adjudicationHistory.njk`, {
      prisonerNumber: req.params.prisonerNumber,
      prisonerName,
      breadcrumbName,
      adjudications: results,
      filter,
      statuses: reportedAdjudicationStatuses(filter),
      establishments: establishmentCheckboxes(filter, uniqueListOfAgenciesForPrisoner),
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      errors,
      maxDate: formatDateForDatePicker(new Date().toISOString(), 'short'),
      uniqueListOfAgenciesForPrisoner,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const uiFilter = uiAdjudicationHistoryFilterFromRequest(req)
    const filter = adjudicationHistoryFilterFromUiFilter(uiFilter)
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(prisonerNumber, user)
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
    const prisonerName = await this.getPrisonerName(prisoner)
    const breadcrumbName = await this.getBreadcrumbName(prisoner)

    return this.renderView(
      req,
      res,
      uiFilter,
      results,
      [],
      prisonerName,
      breadcrumbName,
      uniqueListOfAgenciesForPrisoner
    )
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const uiFilter = adjudicationHistoryUiFilterFromBody(req)
    const errors = validate(uiFilter)
    if (errors && errors.length !== 0) {
      const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(prisonerNumber, user)
      const prisonerName = await this.getPrisonerName(prisoner)
      const breadcrumbName = await this.getBreadcrumbName(prisoner)
      const uniqueListOfAgenciesForPrisoner =
        await this.reportedAdjudicationsService.getUniqueListOfAgenciesForPrisoner(prisonerNumber, user)

      return this.renderView(
        req,
        res,
        uiFilter,
        { size: 20, number: 0, totalElements: 0, content: [] },
        errors,
        prisonerName,
        breadcrumbName,
        uniqueListOfAgenciesForPrisoner
      )
    }
    return res.redirect(adjudicationUrls.adjudicationHistory.urls.filter(prisonerNumber, uiFilter))
  }

  getPrisonerName = async (prisoner: PrisonerResultSummary) => {
    return convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)
  }

  getBreadcrumbName = async (prisoner: PrisonerResultSummary) => {
    return convertToTitleCase(`${prisoner.lastName}, ${prisoner.firstName} `)
  }
}
