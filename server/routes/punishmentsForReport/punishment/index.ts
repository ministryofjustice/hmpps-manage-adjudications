import express, { RequestHandler, Router } from 'express'

import PunishmentRoute from './punishment'
import PunishmentEditRoute from './punishmentEdit'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../services/punishmentBatchSessionService'

export default function PunishmentRoutes({
  userService,
  punishmentsService,
  punishmentBatchSessionService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  punishmentBatchSessionService: PunishmentBatchSessionService
}): Router {
  const router = express.Router()

  const punishmentRoute = new PunishmentRoute(userService, punishmentsService, punishmentBatchSessionService)
  const punishmentEditRoute = new PunishmentEditRoute(userService, punishmentsService, punishmentBatchSessionService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.punishment.matchers.start, punishmentRoute.view)
  post(adjudicationUrls.punishment.matchers.start, punishmentRoute.submit)
  get(adjudicationUrls.punishment.matchers.edit, punishmentEditRoute.view)
  post(adjudicationUrls.punishment.matchers.edit, punishmentEditRoute.submit)

  return router
}
