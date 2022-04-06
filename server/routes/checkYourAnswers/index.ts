import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CheckYourAnswersRoutes from './checkYourAnswers'
import CheckYourAnswersBeforeChangeReporterRoutes from './checkYourAnswersBeforeChangeReporter'
import CheckYourAnswersBeforeChangeReviewerRoutes from './checkYourAnswersBeforeChangeReviewer'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import { checkYourAnswers } from '../../utils/urlGenerator'

export default function CheckAnswersRoutes({
  placeOnReportService,
  locationService,
  decisionTreeService,
}: {
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const checkYourAnswersRoute = new CheckYourAnswersRoutes(placeOnReportService, locationService, decisionTreeService)
  const checkYourAnswersBeforeChangeReviewerRoutes = new CheckYourAnswersBeforeChangeReviewerRoutes(
    placeOnReportService,
    locationService,
    decisionTreeService
  )
  const checkYourAnswersBeforeChangeReporter = new CheckYourAnswersBeforeChangeReporterRoutes(
    placeOnReportService,
    locationService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(checkYourAnswers.matchers.start, checkYourAnswersRoute.view)
  post(checkYourAnswers.matchers.start, checkYourAnswersRoute.submit)
  get(checkYourAnswers.matchers.reporterView, checkYourAnswersBeforeChangeReporter.view)
  post(checkYourAnswers.matchers.reporterView, checkYourAnswersBeforeChangeReporter.submit)
  get(checkYourAnswers.matchers.reviewerView, checkYourAnswersBeforeChangeReviewerRoutes.view)
  post(checkYourAnswers.matchers.reviewerView, checkYourAnswersBeforeChangeReviewerRoutes.submit)
  return router
}
