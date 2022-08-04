import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CheckYourAnswersRoutes from './checkYourAnswers'
import CheckYourAnswersBeforeChangeReporterRoutes from './checkYourAnswersBeforeChangeReporter'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function CheckAnswersRoutes({
  placeOnReportService,
  locationService,
  decisionTreeService,
  reportedAdjudicationsService,
}: {
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
  decisionTreeService: DecisionTreeService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const checkYourAnswersRoute = new CheckYourAnswersRoutes(
    placeOnReportService,
    locationService,
    decisionTreeService,
    reportedAdjudicationsService
  )
  const checkYourAnswersBeforeChangeReporter = new CheckYourAnswersBeforeChangeReporterRoutes(
    placeOnReportService,
    locationService,
    decisionTreeService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.checkYourAnswers.matchers.start, checkYourAnswersRoute.view)
  post(adjudicationUrls.checkYourAnswers.matchers.start, checkYourAnswersRoute.submit)
  get(adjudicationUrls.checkYourAnswers.matchers.reporterView, checkYourAnswersBeforeChangeReporter.view)
  post(adjudicationUrls.checkYourAnswers.matchers.reporterView, checkYourAnswersBeforeChangeReporter.submit)
  return router
}
