import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrisonerReportRoutes from './prisonerReport'
import PrisonerReportReviewRoutes from './prisonerReportReview'

import PlaceOnReportService from '../../services/placeOnReportService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'

export default function prisonerReportRoutes({
  reportedAdjudicationsService,
  placeOnReportService,
  locationService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
  userService: UserService
}): Router {
  const router = express.Router()

  const prisonerReport = new PrisonerReportRoutes(reportedAdjudicationsService, placeOnReportService, locationService)
  const prisonerReportReview = new PrisonerReportReviewRoutes(
    reportedAdjudicationsService,
    placeOnReportService,
    locationService,
    userService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:adjudicationNumber/report', prisonerReport.view)
  get('/:prisonerNumber/:adjudicationNumber/review', prisonerReportReview.view)

  return router
}
