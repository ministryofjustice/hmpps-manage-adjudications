import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AllCompletedReports from './allCompletedReports'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function allCompletedReportsRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const allCompletedReports = new AllCompletedReports(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', allCompletedReports.view)

  return router
}
