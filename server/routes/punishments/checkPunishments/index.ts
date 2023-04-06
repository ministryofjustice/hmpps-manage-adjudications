import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import CheckPunishmentsRoute from './checkPunishments'

import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'

export default function CheckPunishmentRoutes({
  punishmentsService,
}: {
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const checkPunishmentRoute = new CheckPunishmentsRoute(punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.checkPunishments.matchers.start, checkPunishmentRoute.view)
  post(adjudicationUrls.checkPunishments.matchers.start, checkPunishmentRoute.submit)

  return router
}
