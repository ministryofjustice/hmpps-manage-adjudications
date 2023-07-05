import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import WillPunishmentBeSuspendedRoute from './willPunishmentBeSuspended'
import WillPunishmentBeSuspendedEditRoute from './willPunishmentBeSuspendedEdit'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'

export default function willPunishmentBeSuspendedRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const willPunishmentBeSuspendedRoute = new WillPunishmentBeSuspendedRoute(userService, punishmentsService)
  const willPunishmentBeSuspendedEditRoute = new WillPunishmentBeSuspendedEditRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.isPunishmentSuspended.matchers.start, willPunishmentBeSuspendedRoute.view)
  post(adjudicationUrls.isPunishmentSuspended.matchers.start, willPunishmentBeSuspendedRoute.submit)
  get(adjudicationUrls.isPunishmentSuspended.matchers.edit, willPunishmentBeSuspendedEditRoute.view)
  post(adjudicationUrls.isPunishmentSuspended.matchers.edit, willPunishmentBeSuspendedEditRoute.submit)

  return router
}
