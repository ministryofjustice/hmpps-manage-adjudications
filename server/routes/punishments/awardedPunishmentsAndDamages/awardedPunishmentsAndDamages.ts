import { Request, Response } from 'express'
import adjudicationUrls from '../../../utils/urlGenerator'
import { FormError } from '../../../@types/template'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import { AwardedPunishmentsAndDamages, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import {
  awardedPunishmentsAndDamagesFilterFromUiFilter,
  AwardedPunishmentsAndDamagesUiFilter,
  fillInAwardedPunishmentsAndDamagesFilterDefaults,
  uiAwardedPunishmentsAndDamagesFilterFromBody,
  uiAwardedPunishmentsAndDamagesFilterFromRequest,
} from '../../../utils/adjudicationFilterHelper'
import LocationService from '../../../services/locationService'
import { PrisonLocation } from '../../../data/PrisonLocationResult'

export default class AwardedPunishmentsAndDamagesRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService
  ) {}

  private renderView = async (
    res: Response,
    filter: AwardedPunishmentsAndDamagesUiFilter,
    possibleLocations: PrisonLocation[],
    results: AwardedPunishmentsAndDamages[],
    errors: FormError[]
  ): Promise<void> => {
    return res.render(`pages/awardedPunishmentsAndDamages/awardedPunishmentsAndDamages.njk`, {
      results,
      filter,
      possibleLocations,
      clearUrl: adjudicationUrls.awardedPunishmentsAndDamages.urls.start(),
      allAwardedPunishmentsAndDamagesHref: adjudicationUrls.awardedPunishmentsAndDamages.urls.start(),
      financialAwardedPunishmentsAndDamagesHref: adjudicationUrls.awardedPunishmentsAndDamages.urls.financial(),
      additionalDaysAwardedPunishmentsHref: adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays(),
      activeTab: 'allAwardedPunishmentsAndDamages',
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const uiFilter = fillInAwardedPunishmentsAndDamagesFilterDefaults(
      uiAwardedPunishmentsAndDamagesFilterFromRequest(req)
    )
    const filter = awardedPunishmentsAndDamagesFilterFromUiFilter(uiFilter)
    const possibleLocations = await this.locationService.getLocationsForUser(user)
    const results = await this.reportedAdjudicationsService.getAwardedPunishmentsAndDamages(
      filter,
      possibleLocations,
      user
    )

    const displayForAdjudicationStatuses = [
      ReportedAdjudicationStatus.CHARGE_PROVED,
      ReportedAdjudicationStatus.ADJOURNED,
      ReportedAdjudicationStatus.REFER_POLICE,
      ReportedAdjudicationStatus.REFER_GOV,
      ReportedAdjudicationStatus.REFER_INAD,
      ReportedAdjudicationStatus.DISMISSED,
    ]

    const filteredResults = results.filter(result => displayForAdjudicationStatuses.includes(result.status))
    return this.renderView(res, uiFilter, possibleLocations, filteredResults, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = uiAwardedPunishmentsAndDamagesFilterFromBody(req)
    return res.redirect(adjudicationUrls.awardedPunishmentsAndDamages.urls.filter(uiFilter))
  }
}
