import express, { Router } from 'express'

import SchedulePage from './schedulePage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function PunishmentScheduleRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const page = new SchedulePage(userService, punishmentsService)

  router.get(adjudicationUrls.punishmentSchedule.matchers.start, page.view)
  router.post(adjudicationUrls.punishmentSchedule.matchers.start, page.submit)

  return router
}
