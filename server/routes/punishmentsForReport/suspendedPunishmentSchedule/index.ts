import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import PunishmentsService from '../../../services/punishmentsService'
import UserService from '../../../services/userService'

import adjudicationUrls from '../../../utils/urlGenerator'
import SuspendedPunishmentScheduleExistingRoute from './suspendedPunishmentScheduleExisting'
import SuspendedPunishmentScheduleManualRoute from './suspendedPunishmentScheduleManual'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function suspendedPunishmentScheduleRoutes({
  punishmentsService,
  userService,
  reportedAdjudicationsService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()
  const suspendedPunishmentScheduleExistingRoute = new SuspendedPunishmentScheduleExistingRoute(
    punishmentsService,
    userService,
    reportedAdjudicationsService
  )
  const suspendedPunishmentScheduleManualRoute = new SuspendedPunishmentScheduleManualRoute(
    punishmentsService,
    userService,
    reportedAdjudicationsService
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
