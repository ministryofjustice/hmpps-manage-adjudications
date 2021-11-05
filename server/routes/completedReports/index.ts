import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CompletedResports from './completedReports'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function completedReportsRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const completedReports = new CompletedResports(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', completedReports.view)

  return router
}
