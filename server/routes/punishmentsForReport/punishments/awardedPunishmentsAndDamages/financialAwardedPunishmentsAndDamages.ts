import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQuery } from 'querystring'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { AwardedPunishmentsAndDamages } from '../../../../data/ReportedAdjudicationResult'
import {
  awardedPunishmentsAndDamagesFilterFromUiFilter,
  AwardedPunishmentsAndDamagesUiFilter,
  fillInAwardedPunishmentsAndDamagesFilterDefaults,
  uiAwardedPunishmentsAndDamagesFilterFromBody,
  uiAwardedPunishmentsAndDamagesFilterFromRequest,
} from '../../../../utils/adjudicationFilterHelper'
import LocationService from '../../../../services/locationService'
import { PrisonLocation } from '../../../../data/PrisonLocationResult'

export default class FinancialAwardedPunishmentsAndDamagesRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    filter: AwardedPunishmentsAndDamagesUiFilter,
    possibleLocations: PrisonLocation[],
    results: AwardedPunishmentsAndDamages[],
    errors: FormError[]
  ): Promise<void> => {
    const allAwardedPunishmentsAndDamagesHref = url.format({
      pathname: adjudicationUrls.awardedPunishmentsAndDamages.urls.start(),
      query: { ...(req.query as ParsedUrlQuery) },
    })
    const financialAwardedPunishmentsAndDamagesHref = url.format({
      pathname: adjudicationUrls.awardedPunishmentsAndDamages.urls.financial(),
      query: { ...(req.query as ParsedUrlQuery) },
    })
    const additionalDaysAwardedPunishmentsHref = url.format({
      pathname: adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays(),
      query: { ...(req.query as ParsedUrlQuery) },
    })

    return res.render(`pages/awardedPunishmentsAndDamages/financialAwardedPunishmentsAndDamages.njk`, {
      results,
      filter,
      possibleLocations,
      clearUrl: adjudicationUrls.awardedPunishmentsAndDamages.urls.financial(),
      allAwardedPunishmentsAndDamagesHref,
      financialAwardedPunishmentsAndDamagesHref,
      additionalDaysAwardedPunishmentsHref,
      activeTab: 'financialAwardedPunishmentsAndDamages',
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
    const filteredResults = results.filter(result => result.financialPunishmentCount > 0)

    return this.renderView(req, res, uiFilter, possibleLocations, filteredResults, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = uiAwardedPunishmentsAndDamagesFilterFromBody(req)
    return res.redirect(adjudicationUrls.awardedPunishmentsAndDamages.urls.financialFilter(uiFilter))
  }
}
