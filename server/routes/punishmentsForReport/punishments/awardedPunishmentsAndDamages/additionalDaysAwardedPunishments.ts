import url from 'url'
import { ParsedUrlQuery } from 'querystring'
import { Request, Response } from 'express'
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
import UserService from '../../../../services/userService'

export default class AdditionalDaysAwardedPunishmentsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService
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

    return res.render(`pages/awardedPunishmentsAndDamages/additionalDaysAwardedPunishments.njk`, {
      results,
      filter,
      possibleLocations,
      clearUrl: adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays(),
      allAwardedPunishmentsAndDamagesHref,
      financialAwardedPunishmentsAndDamagesHref,
      additionalDaysAwardedPunishmentsHref,
      activeTab: 'additionalDaysAwardedPunishments',
      errors,
      emptyStateText: 'There are no hearings for this date where added days were given.',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const uiFilter = fillInAwardedPunishmentsAndDamagesFilterDefaults(
      uiAwardedPunishmentsAndDamagesFilterFromRequest(req)
    )
    const filter = awardedPunishmentsAndDamagesFilterFromUiFilter(uiFilter)
    const possibleLocations = await this.locationService.getLocationsForUser(user)
    const userIsALO = await this.userService.isUserALO(user)
    const results = await this.reportedAdjudicationsService.getAwardedPunishmentsAndDamages(
      filter,
      possibleLocations,
      userIsALO,
      user
    )
    const filteredResults = results.filter(result => result.additionalDays > 0 || result.prospectiveAdditionalDays > 0)

    return this.renderView(req, res, uiFilter, possibleLocations, filteredResults, [])
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const uiFilter = uiAwardedPunishmentsAndDamagesFilterFromBody(req)
    return res.redirect(adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDaysFilter(uiFilter))
  }
}
