import type { Router } from 'express'
import express from 'express'

import WhichPunishmentsPage from './whichPunishmentsPage'

import adjudicationUrls from '../../../../utils/urlGenerator'
import type PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'

export default function WhichPunishmentsRoutes({
  punishmentsService,
  rehabBatchSessionService,
}: {
  punishmentsService: PunishmentsService
  rehabBatchSessionService: RehabBatchSessionService
}): Router {
  const router = express.Router()

  const page = new WhichPunishmentsPage(punishmentsService, rehabBatchSessionService)

  router.get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.matchers.start, page.view)
  router.post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.matchers.start, page.submit)

  return router
}
