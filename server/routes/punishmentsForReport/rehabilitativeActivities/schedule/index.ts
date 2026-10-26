import type { Router } from 'express'
import express from 'express'

import RehabilitativeActivitiesSchedulePage from './rehabilitativeActivitiesSchedulePage'

import type UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import type PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'

export default function RehabilitativeActivitiesScheduleRoutes({
  userService,
  punishmentsService,
  rehabBatchSessionService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  rehabBatchSessionService: RehabBatchSessionService
}): Router {
  const router = express.Router()

  const page = new RehabilitativeActivitiesSchedulePage(userService, punishmentsService, rehabBatchSessionService)

  router.get(adjudicationUrls.rehabilitativeActivitiesSchedule.matchers.start, page.view)
  router.post(adjudicationUrls.rehabilitativeActivitiesSchedule.matchers.start, page.submit)

  return router
}
