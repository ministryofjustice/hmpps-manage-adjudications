import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import PunishmentsTabReviewerRoute from './punishmentsTabReviewer'
import PunishmentsTabReporterRoute from './punishmentsTabReporter'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'

export default function PunishmentsAndDamagesRoutes({
  reportedAdjudicationsService,
  userService,
  outcomesService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const hearingTabReviewerRoute = new PunishmentsTabReviewerRoute(
    reportedAdjudicationsService,
    userService,
    outcomesService
  )
  const hearingTabReporterRoute = new PunishmentsTabReporterRoute(reportedAdjudicationsService, outcomesService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishmentsAndDamages.matchers.review, hearingTabReviewerRoute.view)
  get(adjudicationUrls.punishmentsAndDamages.matchers.report, hearingTabReporterRoute.view)

  return router
}