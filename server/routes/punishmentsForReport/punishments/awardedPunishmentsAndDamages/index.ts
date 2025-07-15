import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../../../utils/urlGenerator'
import AwardedPunishmentsAndDamagesRoutes from './awardedPunishmentsAndDamages'
import FinancialAwardedPunishmentsAndDamagesRoutes from './financialAwardedPunishmentsAndDamages'
import AdditionalDaysAwardedPunishmentsRoutes from './additionalDaysAwardedPunishments'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import LocationService from '../../../../services/locationService'
import UserService from '../../../../services/userService'

export default function awardedPunishmentsAndDamagesRoutes({
  reportedAdjudicationsService,
  locationService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  locationService: LocationService
  userService: UserService
}): Router {
  const router = express.Router()

  const awardedPunishmentsAndDamagesRoute = new AwardedPunishmentsAndDamagesRoutes(
    reportedAdjudicationsService,
    locationService,
    userService
  )

  const financialAwardedPunishmentsAndDamagesRoute = new FinancialAwardedPunishmentsAndDamagesRoutes(
    reportedAdjudicationsService,
    locationService,
    userService
  )

  const additionalDaysAwardedPunishmentsRoute = new AdditionalDaysAwardedPunishmentsRoutes(
    reportedAdjudicationsService,
    locationService,
    userService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.awardedPunishmentsAndDamages.matchers.start, awardedPunishmentsAndDamagesRoute.view)
  post(adjudicationUrls.awardedPunishmentsAndDamages.matchers.start, awardedPunishmentsAndDamagesRoute.submit)

  get(adjudicationUrls.awardedPunishmentsAndDamages.matchers.financial, financialAwardedPunishmentsAndDamagesRoute.view)
  post(
    adjudicationUrls.awardedPunishmentsAndDamages.matchers.financial,
    financialAwardedPunishmentsAndDamagesRoute.submit
  )

  get(adjudicationUrls.awardedPunishmentsAndDamages.matchers.additionalDays, additionalDaysAwardedPunishmentsRoute.view)
  post(
    adjudicationUrls.awardedPunishmentsAndDamages.matchers.additionalDays,
    additionalDaysAwardedPunishmentsRoute.submit
  )

  return router
}
