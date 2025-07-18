import express, { RequestHandler, Router } from 'express'

import WillPunishmentBeSuspendedRoute from './willPunishmentBeSuspended'
import WillPunishmentBeSuspendedEditRoute from './willPunishmentBeSuspendedEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function willPunishmentBeSuspendedRoutesV1({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const willPunishmentBeSuspendedRoute = new WillPunishmentBeSuspendedRoute(userService, punishmentsService)
  const willPunishmentBeSuspendedEditRoute = new WillPunishmentBeSuspendedEditRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.isPunishmentSuspendedAdditionalDays.matchers.start, willPunishmentBeSuspendedRoute.view)
  post(adjudicationUrls.isPunishmentSuspendedAdditionalDays.matchers.start, willPunishmentBeSuspendedRoute.submit)
  get(adjudicationUrls.isPunishmentSuspendedAdditionalDays.matchers.edit, willPunishmentBeSuspendedEditRoute.view)
  post(adjudicationUrls.isPunishmentSuspendedAdditionalDays.matchers.edit, willPunishmentBeSuspendedEditRoute.submit)

  return router
}
