import express, { RequestHandler, Router } from 'express'

import AllCompletedReports from './allCompletedReports'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default function allCompletedReportsRoutes({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const allCompletedReportsRoute = new AllCompletedReports(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.allCompletedReports.matchers.start, allCompletedReportsRoute.view)
  post(adjudicationUrls.allCompletedReports.matchers.start, allCompletedReportsRoute.submit)

  return router
}
