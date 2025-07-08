import express, { RequestHandler, Router } from 'express'

import PaybackPunishmentSchedulePage from './paybackPunishmentSchedule'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function paybackPunishmentScheduleRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const paybackPunishmentScheduleRoute = new PaybackPunishmentSchedulePage(userService, punishmentsService)
  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.paybackPunishmentSchedule.matchers.start, paybackPunishmentScheduleRoute.view)

  return router
}
