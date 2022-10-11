import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import AdjudicationReportRoutes from './adjudicationReport'
import AdjudicationReportReviewRoutes from './adjudicationReportReview'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import DecisionTreeService from '../../../services/decisionTreeService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default function adjudicationReportRoutes({
  reportedAdjudicationsService,
  locationService,
  userService,
  decisionTreeService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  locationService: LocationService
  userService: UserService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const prisonerReportRoute = new AdjudicationReportRoutes(
    reportedAdjudicationsService,
    locationService,
    decisionTreeService
  )
  const prisonerReportReview = new AdjudicationReportReviewRoutes(
    reportedAdjudicationsService,
    locationService,
    userService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.adjudicationReport.matchers.report, prisonerReportRoute.view)
  get(adjudicationUrls.adjudicationReport.matchers.review, prisonerReportReview.view)
  post(adjudicationUrls.adjudicationReport.matchers.review, prisonerReportReview.submit)

  return router
}
