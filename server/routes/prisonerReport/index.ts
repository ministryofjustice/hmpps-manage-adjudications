import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrisonerReportRoutes from './prisonerReport'
import PrisonerReportReviewRoutes from './prisonerReportReview'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'

export default function prisonerReportRoutes({
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

  const prisonerReport = new PrisonerReportRoutes(reportedAdjudicationsService, locationService, decisionTreeService)
  const prisonerReportReview = new PrisonerReportReviewRoutes(
    reportedAdjudicationsService,
    locationService,
    userService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:adjudicationNumber/report', prisonerReport.view)
  get('/:prisonerNumber/:adjudicationNumber/review', prisonerReportReview.view)

  return router
}
