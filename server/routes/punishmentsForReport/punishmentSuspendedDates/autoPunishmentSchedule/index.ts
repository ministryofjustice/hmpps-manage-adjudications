import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import AutoPunishmentSuspendedScheduleRoute from './autoPunishmentSchedule'
import AutoPunishmentSuspendedManualScheduleRoute from './autoPunishmentScheduleManual'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function AutoPunishmentSuspendedScheduleRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const autoPunishmentScheduleRoute = new AutoPunishmentSuspendedScheduleRoute(userService, punishmentsService)
  const autoPunishmentManualScheduleRoute = new AutoPunishmentSuspendedManualScheduleRoute(
    userService,
    punishmentsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.suspendedPunishmentAutoDates.matchers.existingPunishment, autoPunishmentScheduleRoute.view)
  get(adjudicationUrls.suspendedPunishmentAutoDates.matchers.manualPunishment, autoPunishmentManualScheduleRoute.view)

  return router
}
