import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import HearingDetailsReviewerRoute from './hearingDetailsReviewer'
import HearingDetailsReporterRoute from './hearingDetailsReporter'

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

  const hearingDetailsReviewerRoute = new HearingDetailsReviewerRoute(reportedAdjudicationsService, userService)
  const hearingDetailsReporterRoute = new HearingDetailsReporterRoute(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingDetails.matchers.review, hearingDetailsReviewerRoute.view)
  post(adjudicationUrls.hearingDetails.matchers.review, hearingDetailsReviewerRoute.submit)
  get(adjudicationUrls.hearingDetails.matchers.report, hearingDetailsReporterRoute.view)

  return router
}
