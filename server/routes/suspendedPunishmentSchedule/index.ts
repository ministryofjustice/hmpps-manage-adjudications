import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PunishmentsService from '../../services/punishmentsService'
import UserService from '../../services/userService'

import adjudicationUrls from '../../utils/urlGenerator'
import SuspendedPunishmentScheduleExistingRoute from './suspendedPunishmentScheduleExisting'
import SuspendedPunishmentScheduleManualRoute from './suspendedPunishmentScheduleManual'

export default function suspendedPunishmentScheduleRoutes({
  punishmentsService,
  userService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
}): Router {
  const router = express.Router()
  const suspendedPunishmentScheduleExistingRoute = new SuspendedPunishmentScheduleExistingRoute(
    punishmentsService,
    userService
  )
  const suspendedPunishmentScheduleManualRoute = new SuspendedPunishmentScheduleManualRoute(
    punishmentsService,
    userService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(
    adjudicationUrls.suspendedPunishmentSchedule.matchers.existingPunishment,
    suspendedPunishmentScheduleExistingRoute.view
  )
  post(
    adjudicationUrls.suspendedPunishmentSchedule.matchers.existingPunishment,
    suspendedPunishmentScheduleExistingRoute.submit
  )
  get(
    adjudicationUrls.suspendedPunishmentSchedule.matchers.manualPunishment,
    suspendedPunishmentScheduleManualRoute.view
  )
  post(
    adjudicationUrls.suspendedPunishmentSchedule.matchers.manualPunishment,
    suspendedPunishmentScheduleManualRoute.submit
  )

  return router
}
