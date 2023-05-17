import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import PrisonerReportRoutes from './prisonerReport'
import PrisonerReportReviewRoutes from './prisonerReportReview'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import DecisionTreeService from '../../../services/decisionTreeService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default function prisonerReportRoutes({
  reportedAdjudicationsService,
  userService,
  decisionTreeService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const prisonerReportRoute = new PrisonerReportRoutes(reportedAdjudicationsService, decisionTreeService)
  const prisonerReportReview = new PrisonerReportReviewRoutes(
    reportedAdjudicationsService,
    userService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.prisonerReport.matchers.report, prisonerReportRoute.view)
  get(adjudicationUrls.prisonerReport.matchers.review, prisonerReportReview.view)
  post(adjudicationUrls.prisonerReport.matchers.review, prisonerReportReview.submit)

  return router
}
