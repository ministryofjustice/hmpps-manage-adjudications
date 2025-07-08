import express, { RequestHandler, Router } from 'express'

import AutoPunishmentScheduleRoute from './autoPunishmentSchedule'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function AutoPunishmentScheduleRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const autoPunishmentScheduleRoute = new AutoPunishmentScheduleRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.punishmentAutomaticDateSchedule.matchers.start, autoPunishmentScheduleRoute.view)

  return router
}
