import { Request, Response } from 'express'
import { datePickerToApi } from '../../../utils/utils'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { FormError } from '../../../@types/template'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import { ScheduledHearingEnhanced } from '../../../data/ReportedAdjudicationResult'
import {
  AwardedPunishmentsAndDamagesUiFilter,
  fillInAwardedPunishmentsAndDamagesUiFilterDefaults, uiAwardedPunishmentsAndDamagesUiFilterFromBody,
  uiAwardedPunishmentsAndDamagesUiFilterFromRequest,
} from '../../../utils/adjudicationFilterHelper'
import LocationService from '../../../services/locationService'
import { PrisonLocation } from '../../../data/PrisonLocationResult'

export default class AwardedPunishmentsAndDamagesRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService,
    private readonly locationService: LocationService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: AwardedPunishmentsAndDamagesUiFilter,
    possibleLocations: PrisonLocation[],
    results: ScheduledHearingEnhanced[],
    errors: FormError[]
  ): Promise<void> => {
    return res.render(`pages/awardedPunishmentsAndDamages/awardedPunishmentsAndDamages.njk`, {
      hearings: results,
      filter,
      possibleLocations,
      clearUrl: adjudicationUrls.awardedPunishmentsAndDamages.urls.start(),
      allAwardedPunishmentsAndDamagesHref: adjudicationUrls.awardedPunishmentsAndDamages.urls.start(),
      financialAwardedPunishmentsAndDamagesHref: adjudicationUrls.awardedPunishmentsAndDamages.urls.financial(),
      additionalDaysAwardedPunishmentsHrefHref: adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays(),
      activeTab: 'allAwardedPunishmentsAndDamages',
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const uiFilter = fillInAwardedPunishmentsAndDamagesUiFilterDefaults(
      uiAwardedPunishmentsAndDamagesUiFilterFromRequest(req)
    )
    const possibleLocations = await this.locationService.getLocationsForUser(user)
    // const filter = awardedPunishmentsAndDamagesFilterFromUiFilter(uiFilter)
    const formattedUiHearingDate = datePickerToApi(uiFilter.hearingDate)
    const results = await this.reportedAdjudicationsService.getAllHearings(formattedUiHearingDate, user)
    return this.renderView(req, res, uiFilter, possibleLocations, results, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = uiAwardedPunishmentsAndDamagesUiFilterFromBody(req)
    return res.redirect(adjudicationUrls.awardedPunishmentsAndDamages.urls.filter(uiFilter))
  }
}
