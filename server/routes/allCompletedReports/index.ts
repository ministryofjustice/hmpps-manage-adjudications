import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AllCompletedReports from './allCompletedReports'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'

export default function allCompletedReportsRoutes({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const allCompletedReports = new AllCompletedReports(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', allCompletedReports.view)

  return router
}
