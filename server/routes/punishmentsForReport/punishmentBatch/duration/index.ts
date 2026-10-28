import type { Router } from 'express'
import express from 'express'

import DurationPage, { PageRequestType } from './durationPage'

import adjudicationUrls from '../../../../utils/urlGenerator'
import type PunishmentsService from '../../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../../services/punishmentBatchSessionService'

export default function DurationRoutes({
  punishmentsService,
  punishmentBatchSessionService,
}: {
  punishmentsService: PunishmentsService
  punishmentBatchSessionService: PunishmentBatchSessionService
}): Router {
  const router = express.Router()

  const page = new DurationPage(PageRequestType.CREATION, punishmentsService, punishmentBatchSessionService)
  const editPage = new DurationPage(PageRequestType.EDIT, punishmentsService, punishmentBatchSessionService)

  router.get(adjudicationUrls.punishmentDuration.matchers.start, page.view)
  router.post(adjudicationUrls.punishmentDuration.matchers.start, page.submit)
  router.get(adjudicationUrls.punishmentDuration.matchers.edit, editPage.view)
  router.post(adjudicationUrls.punishmentDuration.matchers.edit, editPage.submit)

  return router
}
