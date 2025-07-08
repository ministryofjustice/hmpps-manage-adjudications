import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../utils/urlGenerator'
import PlaceOnReportService from '../../services/placeOnReportService'

import DeleteReport from './deleteReport'

export default function CheckAnswersRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const deleteReportRoute = new DeleteReport(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.deleteReport.matchers.delete, deleteReportRoute.view)
  post(adjudicationUrls.deleteReport.matchers.delete, deleteReportRoute.submit)

  return router
}
