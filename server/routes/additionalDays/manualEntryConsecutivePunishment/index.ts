import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ManualEntryConsecutivePunishmentRoute from './manualEntryConsecutivePunishment'
import ManualEntryConsecutivePunishmentEditRoute from './manualEntryConsecutivePunishmentEdit'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'

export default function ManualEntryConsecutivePunishmentRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const manualEntryConsecutivePunishmentRoute = new ManualEntryConsecutivePunishmentRoute(
    userService,
    punishmentsService
  )
  const manualEntryConsecutivePunishmentEditRoute = new ManualEntryConsecutivePunishmentEditRoute(
    userService,
    punishmentsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(
    adjudicationUrls.whichPunishmentIsItConsecutiveToManual.matchers.start,
    manualEntryConsecutivePunishmentRoute.view
  )
  post(
    adjudicationUrls.whichPunishmentIsItConsecutiveToManual.matchers.start,
    manualEntryConsecutivePunishmentRoute.submit
  )
  get(
    adjudicationUrls.whichPunishmentIsItConsecutiveToManual.matchers.edit,
    manualEntryConsecutivePunishmentEditRoute.view
  )
  post(
    adjudicationUrls.whichPunishmentIsItConsecutiveToManual.matchers.edit,
    manualEntryConsecutivePunishmentEditRoute.submit
  )

  return router
}
