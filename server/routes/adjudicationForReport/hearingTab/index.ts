import express, { RequestHandler, Router } from 'express'

import HearingTabReviewerRoute from './hearingTabReviewer'
import HearingTabReporterRoute from './hearingTabReporter'
import HearingTabViewOnlyRoute from './hearingTabViewOnly'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'

export default function HearingDetailsRoutes({
  reportedAdjudicationsService,
  userService,
  outcomesService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const hearingTabReviewerRoute = new HearingTabReviewerRoute(
    reportedAdjudicationsService,
    userService,
    outcomesService,
  )
  const hearingTabReporterRoute = new HearingTabReporterRoute(
    reportedAdjudicationsService,
    outcomesService,
    userService,
  )

  const hearingTabViewOnlyRoute = new HearingTabViewOnlyRoute(
    reportedAdjudicationsService,
    outcomesService,
    userService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.hearingDetails.matchers.review, hearingTabReviewerRoute.view)
  post(adjudicationUrls.hearingDetails.matchers.review, hearingTabReviewerRoute.submit)
  get(adjudicationUrls.hearingDetails.matchers.report, hearingTabReporterRoute.view)
  get(adjudicationUrls.hearingDetails.matchers.viewOnly, hearingTabViewOnlyRoute.view)

  return router
}
