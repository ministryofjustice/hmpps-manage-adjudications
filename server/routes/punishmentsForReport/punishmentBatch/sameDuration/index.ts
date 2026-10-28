import type { Router } from 'express'
import express from 'express'

import SameDurationPage from './sameDurationPage'

import adjudicationUrls from '../../../../utils/urlGenerator'
import type PunishmentsService from '../../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../../services/punishmentBatchSessionService'

export default function SameDurationRoutes({
  punishmentsService,
  punishmentBatchSessionService,
}: {
  punishmentsService: PunishmentsService
  punishmentBatchSessionService: PunishmentBatchSessionService
}): Router {
  const router = express.Router()

  const page = new SameDurationPage(punishmentsService, punishmentBatchSessionService)

  router.get(adjudicationUrls.punishmentSameDuration.matchers.start, page.view)
  router.post(adjudicationUrls.punishmentSameDuration.matchers.start, page.submit)

  return router
}
