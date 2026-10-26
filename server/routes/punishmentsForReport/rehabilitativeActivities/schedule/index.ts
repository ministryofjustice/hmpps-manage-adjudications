import express, { Router } from 'express'

import RehabilitativeActivitiesSchedulePage from './rehabilitativeActivitiesSchedulePage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function RehabilitativeActivitiesScheduleRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const page = new RehabilitativeActivitiesSchedulePage(userService, punishmentsService)

  router.get(adjudicationUrls.rehabilitativeActivitiesSchedule.matchers.start, page.view)
  router.post(adjudicationUrls.rehabilitativeActivitiesSchedule.matchers.start, page.submit)

  return router
}
