import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CheckYourAnswersRoutes from './checkYourAnswers'
import CheckYourAnswersBeforeChangeReporterRoutes from './checkYourAnswersBeforeChangeReporter'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'

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
  const checkYourAnswersBeforeChangeReporter = new CheckYourAnswersBeforeChangeReporterRoutes(
    placeOnReportService,
    locationService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.checkYourAnswers.matchers.start, checkYourAnswersRoute.view)
  post(adjudicationUrls.checkYourAnswers.matchers.start, checkYourAnswersRoute.submit)
  get(adjudicationUrls.checkYourAnswers.matchers.reporterView, checkYourAnswersBeforeChangeReporter.view)
  post(adjudicationUrls.checkYourAnswers.matchers.reporterView, checkYourAnswersBeforeChangeReporter.submit)
  return router
}
