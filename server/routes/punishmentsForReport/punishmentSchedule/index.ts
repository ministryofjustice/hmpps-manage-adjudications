import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import PunishmentScheduleRoute from './punishmentSchedule'
import PunishmentScheduleEditRoute from './punishmentScheduleEdit'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function PunishmentScheduledRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const punishmentScheduleRoute = new PunishmentScheduleRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )
  const punishmentScheduleEditRoute = new PunishmentScheduleEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishmentSchedule.matchers.start, punishmentScheduleRoute.view)
  post(adjudicationUrls.punishmentSchedule.matchers.start, punishmentScheduleRoute.submit)
  get(adjudicationUrls.punishmentSchedule.matchers.edit, punishmentScheduleEditRoute.view)
  post(adjudicationUrls.punishmentSchedule.matchers.edit, punishmentScheduleEditRoute.submit)

  return router
}
