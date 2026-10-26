import type { Router } from 'express'
import express from 'express'

import WhichPunishmentsPage from './whichPunishmentsPage'

import type UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import type PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'

export default function WhichPunishmentsRoutes({
  userService,
  punishmentsService,
  rehabBatchSessionService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  rehabBatchSessionService: RehabBatchSessionService
}): Router {
  const router = express.Router()

  const page = new WhichPunishmentsPage(userService, punishmentsService, rehabBatchSessionService)

  router.get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.matchers.start, page.view)
  router.post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.matchers.start, page.submit)

  return router
}
