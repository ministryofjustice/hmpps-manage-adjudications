import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import SuspendedUntilDateRoute from './suspendedUntilDate'
import SuspendedUntilDateEditRoute from './suspendedUntilDateEdit'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function suspendedUntilDateRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const suspendedUntilDateRoute = new SuspendedUntilDateRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )
  const suspendedUntilDateEditRoute = new SuspendedUntilDateEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishmentSuspendedUntil.matchers.start, suspendedUntilDateRoute.view)
  post(adjudicationUrls.punishmentSuspendedUntil.matchers.start, suspendedUntilDateRoute.submit)
  get(adjudicationUrls.punishmentSuspendedUntil.matchers.edit, suspendedUntilDateEditRoute.view)
  post(adjudicationUrls.punishmentSuspendedUntil.matchers.edit, suspendedUntilDateEditRoute.submit)

  return router
}
