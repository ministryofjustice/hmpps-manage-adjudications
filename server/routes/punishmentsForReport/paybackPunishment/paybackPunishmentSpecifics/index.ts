import express, { RequestHandler, Router } from 'express'

import PaybackPunishmentSpecificsRoute from './paybackPunishmentSpecifics'
import PaybackPunishmentSpecificsEditRoute from './paybackPunishmentSpecificsEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function PunishmentRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const paybackPunishmentSpecificsRoute = new PaybackPunishmentSpecificsRoute(userService, punishmentsService)
  const paybackPunishmentSpecificsEditRoute = new PaybackPunishmentSpecificsEditRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.paybackPunishmentSpecifics.matchers.start, paybackPunishmentSpecificsRoute.view)
  post(adjudicationUrls.paybackPunishmentSpecifics.matchers.start, paybackPunishmentSpecificsRoute.submit)
  get(adjudicationUrls.paybackPunishmentSpecifics.matchers.edit, paybackPunishmentSpecificsEditRoute.view)
  post(adjudicationUrls.paybackPunishmentSpecifics.matchers.edit, paybackPunishmentSpecificsEditRoute.submit)

  return router
}
