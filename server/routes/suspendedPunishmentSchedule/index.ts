import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PunishmentsService from '../../services/punishmentsService'
import UserService from '../../services/userService'

import adjudicationUrls from '../../utils/urlGenerator'
import SuspendedPunishmentScheduleRoute from './suspendedPunishmentSchedule'

export default function suspendedPunishmentScheduleRoutes({
  punishmentsService,
  userService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
}): Router {
  const router = express.Router()
  const suspendedPunishmentScheduleRoute = new SuspendedPunishmentScheduleRoute(punishmentsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.activateSuspendedPunishments.matchers.start, suspendedPunishmentScheduleRoute.view)
  post(adjudicationUrls.activateSuspendedPunishments.matchers.start, suspendedPunishmentScheduleRoute.submit)

  return router
}
