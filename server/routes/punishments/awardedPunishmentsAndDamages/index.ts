import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import AwardedPunishmentsAndDamagesRoutes from './awardedPunishmentsAndDamages'
import FinancialAwardedPunishmentsAndDamagesRoutes from './financialAwardedPunishmentsAndDamages'
import AdditionalDaysAwardedPunishmentsRoutes from './additionalDaysAwardedPunishments'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'

export default function awardedPunishmentsAndDamagesRoutes({
  reportedAdjudicationsService,
  locationService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const awardedPunishmentsAndDamagesRoute = new AwardedPunishmentsAndDamagesRoutes(
    reportedAdjudicationsService,
    locationService
  )

  const financialAwardedPunishmentsAndDamagesRoute = new FinancialAwardedPunishmentsAndDamagesRoutes(
    reportedAdjudicationsService,
    locationService
  )

  const additionalDaysAwardedPunishmentsRoute = new AdditionalDaysAwardedPunishmentsRoutes(
    reportedAdjudicationsService,
    locationService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

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
