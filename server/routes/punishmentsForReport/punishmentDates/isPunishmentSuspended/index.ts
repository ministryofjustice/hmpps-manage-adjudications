import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import IsPunishmentSuspendedRoute from './isPunishmentSuspended'
import IsPunishmentSuspendedEditRoute from './isPunishmentSuspendedEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function IsPunishmentSuspendedRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const isPunishmentSuspendedRoute = new IsPunishmentSuspendedRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )
  const isPunishmentSuspendedEditRoute = new IsPunishmentSuspendedEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishmentIsSuspended.matchers.start, isPunishmentSuspendedRoute.view)
  post(adjudicationUrls.punishmentIsSuspended.matchers.start, isPunishmentSuspendedRoute.submit)
  get(adjudicationUrls.punishmentIsSuspended.matchers.edit, isPunishmentSuspendedEditRoute.view)
  post(adjudicationUrls.punishmentIsSuspended.matchers.edit, isPunishmentSuspendedEditRoute.submit)

  return router
}
