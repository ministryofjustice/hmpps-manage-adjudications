import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import PrisonerReportRoutes from './prisonerReport'
import PrisonerReportReviewRoutes from './prisonerReportReview'
import PrisonerReportViewRoutes from './prisonerReportViewOnly'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import DecisionTreeService from '../../../services/decisionTreeService'
import adjudicationUrls from '../../../utils/urlGenerator'
import LocationService from '../../../services/locationService'

export default function prisonerReportRoutes({
  reportedAdjudicationsService,
  userService,
  decisionTreeService,
  locationService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
  decisionTreeService: DecisionTreeService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const prisonerReportRoute = new PrisonerReportRoutes(reportedAdjudicationsService, decisionTreeService, userService)
  const prisonerReportReview = new PrisonerReportReviewRoutes(
    reportedAdjudicationsService,
    userService,
    decisionTreeService,
    locationService
  )
  const prisonerReportViewRoute = new PrisonerReportViewRoutes(
    reportedAdjudicationsService,
    decisionTreeService,
    userService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.prisonerReport.matchers.report, prisonerReportRoute.view)
  get(adjudicationUrls.prisonerReport.matchers.review, prisonerReportReview.view)
  post(adjudicationUrls.prisonerReport.matchers.review, prisonerReportReview.submit)
  get(adjudicationUrls.prisonerReport.matchers.viewOnly, prisonerReportViewRoute.view)

  return router
}
