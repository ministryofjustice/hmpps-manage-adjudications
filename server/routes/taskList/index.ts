import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import DraftTaskListRoutes from './draftTaskList'

import PlaceOnReportService from '../../services/placeOnReportService'

export default function draftTaskListRoutesRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const draftTaskList = new DraftTaskListRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:id', draftTaskList.view)

  return router
}
