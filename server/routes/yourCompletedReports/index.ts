import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import YourCompletedReports from './yourCompletedReports'

import CompletedAdjudicationsService from '../../services/completedAdjudicationsService'

export default function yourCompletedReportsRoutes({
  completedAdjudicationsService,
}: {
  completedAdjudicationsService: CompletedAdjudicationsService
}): Router {
  const router = express.Router()

  const yourCompletedReports = new YourCompletedReports(completedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', yourCompletedReports.view)

  return router
}
