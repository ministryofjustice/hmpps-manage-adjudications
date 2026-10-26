import type { Router } from 'express'
import express from 'express'

import SameActivityPage from './sameActivityPage'

import type UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import type PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'

export default function SameActivityRoutes({
  userService,
  punishmentsService,
  rehabBatchSessionService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  rehabBatchSessionService: RehabBatchSessionService
}): Router {
  const router = express.Router()

  const page = new SameActivityPage(userService, punishmentsService, rehabBatchSessionService)

  router.get(adjudicationUrls.sameRehabilitativeActivity.matchers.start, page.view)
  router.post(adjudicationUrls.sameRehabilitativeActivity.matchers.start, page.submit)

  return router
}
