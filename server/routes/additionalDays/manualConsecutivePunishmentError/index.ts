import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ManualConsecutivePunishmentErrorRoute from './manualConsecutivePunishmentError'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'

export default function ManualConsecutivePunishmentErrorRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const manualConsecutivePunishmentErrorRoute = new ManualConsecutivePunishmentErrorRoute(
    userService,
    punishmentsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.manualConsecutivePunishmentError.matchers.start, manualConsecutivePunishmentErrorRoute.view)

  return router
}
