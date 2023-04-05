import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import PunishmentsService from '../../../services/punishmentsService'

import adjudicationUrls from '../../../utils/urlGenerator'
import AwardPunishmentsPage, { PageRequestType } from './awardPunishments'

export default function awardPunishmentsRoutes({
  punishmentsService,
}: {
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()
  const punishmentsUsingApi = new AwardPunishmentsPage(PageRequestType.PUNISHMENTS_FROM_API, punishmentsService)

  const punishmentsUsingSession = new AwardPunishmentsPage(PageRequestType.PUNISHMENTS_FROM_SESSION, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.awardPunishments.matchers.start, punishmentsUsingApi.view)
  get(adjudicationUrls.awardPunishments.matchers.modified, punishmentsUsingSession.view)

  return router
}
