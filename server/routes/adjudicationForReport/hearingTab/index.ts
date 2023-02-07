import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import HearingTabReviewerRoute from './hearingTabReviewer'
import HearingTabReporterRoute from './hearingTabReporter'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'

export default function HearingDetailsRoutes({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const hearingTabReviewerRoute = new HearingTabReviewerRoute(reportedAdjudicationsService, userService)
  const hearingTabReporterRoute = new HearingTabReporterRoute(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingDetails.matchers.review, hearingTabReviewerRoute.view)
  post(adjudicationUrls.hearingDetails.matchers.review, hearingTabReviewerRoute.submit)
  get(adjudicationUrls.hearingDetails.matchers.report, hearingTabReporterRoute.view)

  return router
}
