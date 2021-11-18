import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import YourCompletedReports from './yourCompletedReports'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function yourCompletedReportsRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const yourCompletedReports = new YourCompletedReports(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', yourCompletedReports.view)

  return router
}
