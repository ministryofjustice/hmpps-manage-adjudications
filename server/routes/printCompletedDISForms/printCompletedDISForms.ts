import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import { FormError } from '../../@types/template'
import {
  validate,
  uiPrintDISFormFilterFromRequest,
  fillInPrintDISFormFilterDefaults,
  printDISFormfilterFromUiFilter,
  PrintDISFormsUiFilter,
  PrintDISFormUiFilterFromBody,
} from '../../utils/adjudicationFilterHelper'
import { ReportedAdjudicationEnhancedWithIssuingDetails } from '../../data/ReportedAdjudicationResult'
import adjudicationUrls from '../../utils/urlGenerator'

export default class printCompletedDISFormsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService
  ) {}

  private renderView = async (
    res: Response,
    filter: PrintDISFormsUiFilter,
    results: ReportedAdjudicationEnhancedWithIssuingDetails[],
    errors: FormError[]
  ): Promise<void> => {
    const { user } = res.locals
    const possibleLocations = await this.locationService.getLocationsForUser(user)
    return res.render(`pages/printCompletedDISForms`, {
      reports: results,
      filter,
      possibleLocations,
      results,
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const uiFilter = fillInPrintDISFormFilterDefaults(uiPrintDISFormFilterFromRequest(req))
    const filter = printDISFormfilterFromUiFilter(uiFilter)
    const results = await this.reportedAdjudicationsService.getAdjudicationDISFormData(res.locals.user, filter, true)
    const filteredResults = filter.locationId
      ? await this.reportedAdjudicationsService.filterAdjudicationsByLocation(results, filter.locationId, user)
      : results
    return this.renderView(res, uiFilter, filteredResults, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = PrintDISFormUiFilterFromBody(req)
    const errors = validate(uiFilter)
    if (errors && errors.length !== 0) {
      return this.renderView(res, uiFilter, [], errors)
    }
    return res.redirect(adjudicationUrls.printCompletedDisForms.urls.filter(uiFilter))
  }
}
