import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import PunishmentStartDateChoiceRoute from './startDateChoice'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function SuspendedPunishmentStartDateChoiceRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const startDateChoiceRoute = new PunishmentStartDateChoiceRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.existingPunishment, startDateChoiceRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.existingPunishment, startDateChoiceRoute.submit)

  return router
}
