import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import EnterStartDateRoute from './enterStartDate'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

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

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.suspendedPunishmentStartDate.matchers.existingPunishment, enterStartDateRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDate.matchers.existingPunishment, enterStartDateRoute.submit)

  return router
}
