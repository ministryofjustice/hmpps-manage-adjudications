import express, { RequestHandler, Router } from 'express'

import DraftTaskListRoutes from './draftTaskList'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function draftTaskListRoutesRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const draftTaskList = new DraftTaskListRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.taskList.matchers.start, draftTaskList.view)

  return router
}
