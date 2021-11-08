import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CompletedResports from './completedReports'

import CompletedAdjudicationsService from '../../services/completedAdjudicationsService'

export default function completedReportsRoutes({
  completedAdjudicationsService,
}: {
  completedAdjudicationsService: CompletedAdjudicationsService
}): Router {
  const router = express.Router()

  const completedReports = new CompletedResports(completedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', completedReports.view)

  return router
}
