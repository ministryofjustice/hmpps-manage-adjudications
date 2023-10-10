import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import EnterStartDateRoute from './enterStartDate'
import EnterStartDateEditRoute from './enterStartDateEdit'
import EnterStartDateManualRoute from './enterStartDateManual'
import EnterStartDateManualEditRoute from './enterStartDateManualEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function SuspendedPunishmentEnterStartDateRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const enterStartDateRoute = new EnterStartDateRoute(userService, punishmentsService, reportedAdjudicationsService)
  const enterStartDateEditRoute = new EnterStartDateEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )
  const enterStartDateManualRoute = new EnterStartDateManualRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )
  const enterStartDateManualEditRoute = new EnterStartDateManualEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.suspendedPunishmentStartDate.matchers.existingPunishment, enterStartDateRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDate.matchers.existingPunishment, enterStartDateRoute.submit)
  get(adjudicationUrls.suspendedPunishmentStartDate.matchers.edit, enterStartDateEditRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDate.matchers.edit, enterStartDateEditRoute.submit)
  get(adjudicationUrls.suspendedPunishmentStartDate.matchers.manualPunishment, enterStartDateManualRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDate.matchers.manualPunishment, enterStartDateManualRoute.submit)
  get(adjudicationUrls.suspendedPunishmentStartDate.matchers.manualPunishmentEdit, enterStartDateManualEditRoute.view)
  post(
    adjudicationUrls.suspendedPunishmentStartDate.matchers.manualPunishmentEdit,
    enterStartDateManualEditRoute.submit
  )

  return router
}
