import express, { RequestHandler, Router } from 'express'

import PunishmentsTabReviewerRoute from './punishmentsTabReviewer'
import PunishmentsTabReporterRoute from './punishmentsTabReporter'
import PunishmentsTabViewRoute from './punishmentsTabView'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'

export default function PunishmentsAndDamagesRoutes({
  reportedAdjudicationsService,
  userService,
  punishmentsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const punishmentsTabReviewerRoute = new PunishmentsTabReviewerRoute(
    reportedAdjudicationsService,
    userService,
    punishmentsService,
  )
  const punishmentsTabReporterRoute = new PunishmentsTabReporterRoute(
    reportedAdjudicationsService,
    punishmentsService,
    userService,
  )
  const punishmentsTabReadOnlyRoute = new PunishmentsTabViewRoute(
    reportedAdjudicationsService,
    punishmentsService,
    userService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.punishmentsAndDamages.matchers.review, punishmentsTabReviewerRoute.view)
  get(adjudicationUrls.punishmentsAndDamages.matchers.report, punishmentsTabReporterRoute.view)
  get(adjudicationUrls.punishmentsAndDamages.matchers.viewOnly, punishmentsTabReadOnlyRoute.view)

  return router
}
