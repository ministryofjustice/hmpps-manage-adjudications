import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import { FormError } from '../../@types/template'
import {
  DISFormfilterFromUiFilter,
  DISUiFilter,
  fillInDISFormFilterDefaults,
  uiDISFormFilterFromRequest,
  DISFormUiFilterFromBody,
  validate,
} from '../../utils/adjudicationFilterHelper'
import { ReportedAdjudicationEnhancedWithIssuingDetails } from '../../data/ReportedAdjudicationResult'
import adjudicationUrls from '../../utils/urlGenerator'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: DISUiFilter,
    results: ReportedAdjudicationEnhancedWithIssuingDetails[],
    errors: FormError[]
  ): Promise<void> => {
    const { user } = res.locals
    const possibleLocations = await this.locationService.getLocationsForUser(user)

    return res.render(`pages/confirmDISFormsIssued`, {
      reports: results,
      filter,
      possibleLocations,
      results,
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const uiFilter = fillInDISFormFilterDefaults(uiDISFormFilterFromRequest(req))
    const filter = DISFormfilterFromUiFilter(uiFilter)
    const results = await this.reportedAdjudicationsService.getAdjudicationDISFormData(res.locals.user, filter)

    const filteredResults = filter.locationId
      ? await this.reportedAdjudicationsService.filterAdjudicationsByLocation(results, filter.locationId, user)
      : results
    return this.renderView(req, res, uiFilter, filteredResults, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = DISFormUiFilterFromBody(req)
    const errors = validate(uiFilter)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, uiFilter, [], errors)
    }
    return res.redirect(adjudicationUrls.confirmDISFormsIssued.urls.filter(uiFilter))
  }
}
