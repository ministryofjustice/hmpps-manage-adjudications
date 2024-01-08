import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ActivePunishments from './activePunishments'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function adjudicationHistoryRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()
  const activePunishmentsRoute = new ActivePunishments(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  get(adjudicationUrls.adjudicationHistory.matchers.start, activePunishmentsRoute.view)

  return router
}
