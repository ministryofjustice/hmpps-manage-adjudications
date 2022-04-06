import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ContinueReportSelectRoutes from './continueReportSelect'

import PlaceOnReportService from '../../services/placeOnReportService'
import { selectReport } from '../../utils/urlGenerator'

export default function CheckAnswersRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const continueReportRoute = new ContinueReportSelectRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(selectReport.matchers.start, continueReportRoute.view)

  return router
}
