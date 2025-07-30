import express, { RequestHandler, Router } from 'express'

import ReviewerEditOffenceWarningRoute from './reviewerEditOffenceWarning'

import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function ReviewerEditOffenceWarningRoutes({
  decisionTreeService,
  reportedAdjudicationsService,
  userService,
}: {
  decisionTreeService: DecisionTreeService
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const reviewerEditOffenceWarningRoute = new ReviewerEditOffenceWarningRoute(
    decisionTreeService,
    reportedAdjudicationsService,
    userService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.reviewerEditOffenceWarning.matchers.edit, reviewerEditOffenceWarningRoute.view)

  return router
}
