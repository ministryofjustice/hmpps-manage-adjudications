import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CheckYourAnswersRoutes from './checkYourAnswers'
import CheckYourAnswersBeforeChangeReporterRoutes from './checkYourAnswersBeforeChangeReporter'
import CheckYourAnswersBeforeChangeReviewerRoutes from './checkYourAnswersBeforeChangeReviewer'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'

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

  const checkYourAnswers = new CheckYourAnswersRoutes(placeOnReportService, locationService, decisionTreeService)
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

  get('/:adjudicationNumber', checkYourAnswers.view)
  post('/:adjudicationNumber', checkYourAnswers.submit)
  get('/:adjudicationNumber/report', checkYourAnswersBeforeChangeReporter.view)
  post('/:adjudicationNumber/report', checkYourAnswersBeforeChangeReporter.submit)
  get('/:adjudicationNumber/review', checkYourAnswersBeforeChangeReviewerRoutes.view)
  post('/:adjudicationNumber/review', checkYourAnswersBeforeChangeReviewerRoutes.submit)
  return router
}
