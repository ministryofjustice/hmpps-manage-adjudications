import express, { RequestHandler, Router } from 'express'

import SuspendedUntilDateRoute from './suspendedUntilDate'
import SuspendedUntilDateEditRoute from './suspendedUntilDateEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function suspendedUntilDateAdditionalDaysRoutes({
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
    reportedAdjudicationsService,
  )
  const suspendedUntilDateEditRoute = new SuspendedUntilDateEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.punishmentSuspendedUntilAdditionalDays.matchers.start, suspendedUntilDateRoute.view)
  post(adjudicationUrls.punishmentSuspendedUntilAdditionalDays.matchers.start, suspendedUntilDateRoute.submit)
  get(adjudicationUrls.punishmentSuspendedUntilAdditionalDays.matchers.edit, suspendedUntilDateEditRoute.view)
  post(adjudicationUrls.punishmentSuspendedUntilAdditionalDays.matchers.edit, suspendedUntilDateEditRoute.submit)

  return router
}
