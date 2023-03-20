import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ContinueReportSelectRoutes from './continueReportSelect'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function CheckAnswersRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const continueReportRoute = new ContinueReportSelectRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const removeReport = (path: string, handler: RequestHandler) => router.delete(path, asyncMiddleware(handler))

  get(adjudicationUrls.continueReport.matchers.start, continueReportRoute.view)
  post(adjudicationUrls.continueReport.matchers.start, continueReportRoute.submit)
  removeReport(adjudicationUrls.deleteReport.matchers.delete, continueReportRoute.delete)

  return router
}
