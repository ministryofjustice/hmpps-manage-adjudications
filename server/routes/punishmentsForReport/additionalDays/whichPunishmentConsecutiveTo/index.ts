import express, { RequestHandler, Router } from 'express'

import WhichPunishmentConsecutiveToRoute from './whichPunishmentConsecutiveTo'
import WhichPunishmentConsecutiveToEditRoute from './whichPunishmentConsecutiveToEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function whichPunishmentConsecutiveToRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const whichPunishmentConsecutiveToRoute = new WhichPunishmentConsecutiveToRoute(userService, punishmentsService)
  const whichPunishmentConsecutiveToEditRoute = new WhichPunishmentConsecutiveToEditRoute(
    userService,
    punishmentsService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.whichPunishmentIsItConsecutiveTo.matchers.start, whichPunishmentConsecutiveToRoute.view)
  post(adjudicationUrls.whichPunishmentIsItConsecutiveTo.matchers.start, whichPunishmentConsecutiveToRoute.submit)
  get(adjudicationUrls.whichPunishmentIsItConsecutiveTo.matchers.edit, whichPunishmentConsecutiveToEditRoute.view)
  post(adjudicationUrls.whichPunishmentIsItConsecutiveTo.matchers.edit, whichPunishmentConsecutiveToEditRoute.submit)

  return router
}
