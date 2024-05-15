import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import PaybackPunishmentDurationRoute from './paybackPunishmentDuration'
import PaybackPunishmentDurationEditRoute from './paybackPunishmentDurationEdit'

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

  const paybackPunishmentDurationRoute = new PaybackPunishmentDurationRoute(userService, punishmentsService)
  const paybackPunishmentDurationEditRoute = new PaybackPunishmentDurationEditRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.paybackPunishmentDuration.matchers.start, paybackPunishmentDurationRoute.view)
  post(adjudicationUrls.paybackPunishmentDuration.matchers.start, paybackPunishmentDurationRoute.submit)
  get(adjudicationUrls.paybackPunishmentDuration.matchers.edit, paybackPunishmentDurationEditRoute.view)
  post(adjudicationUrls.paybackPunishmentDuration.matchers.edit, paybackPunishmentDurationEditRoute.submit)

  return router
}
