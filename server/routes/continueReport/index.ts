import express, { RequestHandler, Router } from 'express'

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

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.continueReport.matchers.start, continueReportRoute.view)
  post(adjudicationUrls.continueReport.matchers.start, continueReportRoute.submit)

  return router
}
