import express, { RequestHandler, Router } from 'express'

import YourCompletedReports from './yourCompletedReports'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function yourCompletedReportsRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const yourCompletedReportsRoute = new YourCompletedReports(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.yourCompletedReports.matchers.start, yourCompletedReportsRoute.view)
  post(adjudicationUrls.yourCompletedReports.matchers.start, yourCompletedReportsRoute.submit)

  return router
}
