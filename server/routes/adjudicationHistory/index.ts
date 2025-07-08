import express, { RequestHandler, Router } from 'express'

import AdjudicationHistory from './adjudicationHistory'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'

export default function adjudicationHistoryRoutes({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const adjudicationHistoryRoute = new AdjudicationHistory(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.adjudicationHistory.matchers.start, adjudicationHistoryRoute.view)
  post(adjudicationUrls.adjudicationHistory.matchers.start, adjudicationHistoryRoute.submit)

  return router
}
