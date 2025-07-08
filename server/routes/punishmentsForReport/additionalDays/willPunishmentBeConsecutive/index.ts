import express, { RequestHandler, Router } from 'express'

import WillPunishmentBeConsecutiveRoute from './willPunishmentBeConsecutive'
import WillPunishmentBeConsecutiveEditRoute from './willPunishmentBeConsecutiveEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function willPunishmentBeConsecutiveRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const willPunishmentBeConsecutiveRoute = new WillPunishmentBeConsecutiveRoute(userService, punishmentsService)
  const willPunishmentBeConsecutiveEditRoute = new WillPunishmentBeConsecutiveEditRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.isPunishmentConsecutive.matchers.start, willPunishmentBeConsecutiveRoute.view)
  post(adjudicationUrls.isPunishmentConsecutive.matchers.start, willPunishmentBeConsecutiveRoute.submit)
  get(adjudicationUrls.isPunishmentConsecutive.matchers.edit, willPunishmentBeConsecutiveEditRoute.view)
  post(adjudicationUrls.isPunishmentConsecutive.matchers.edit, willPunishmentBeConsecutiveEditRoute.submit)

  return router
}
