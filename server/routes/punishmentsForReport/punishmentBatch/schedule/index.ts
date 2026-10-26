import type { Router } from 'express'
import express from 'express'

import SchedulePage from './schedulePage'

import type UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import type PunishmentsService from '../../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../../services/punishmentBatchSessionService'

export default function PunishmentScheduleRoutes({
  userService,
  punishmentsService,
  punishmentBatchSessionService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  punishmentBatchSessionService: PunishmentBatchSessionService
}): Router {
  const router = express.Router()

  const page = new SchedulePage(userService, punishmentsService, punishmentBatchSessionService)

  router.get(adjudicationUrls.punishmentSchedule.matchers.start, page.view)
  router.post(adjudicationUrls.punishmentSchedule.matchers.start, page.submit)

  return router
}
