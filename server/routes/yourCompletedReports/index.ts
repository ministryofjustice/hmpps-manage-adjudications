import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import YourCompletedReports from './yourCompletedReports'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { yourCompletedReports } from '../../utils/urlGenerator'

export default function yourCompletedReportsRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const yourCompletedReportsRoute = new YourCompletedReports(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(yourCompletedReports.matchers.start, yourCompletedReportsRoute.view)

  return router
}
