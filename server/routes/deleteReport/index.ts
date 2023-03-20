import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import DeleteReport from './deleteReport'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function CheckAnswersRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const deleteReportRoute = new DeleteReport(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.deleteReport.matchers.delete, deleteReportRoute.delete)

  return router
}
