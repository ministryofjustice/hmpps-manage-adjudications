import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CheckYourAnswersRoutes from './checkYourAnswers'
import CheckYourAnswersBeforeChangeReporterRoutes from './checkYourAnswersBeforeChangeReporter'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'

export default function CheckAnswersRoutes({
  placeOnReportService,
  locationService,
}: {
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const checkYourAnswers = new CheckYourAnswersRoutes(placeOnReportService, locationService)
  const checkYourAnswersBeforeChangeReporter = new CheckYourAnswersBeforeChangeReporterRoutes(
    placeOnReportService,
    locationService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:id', checkYourAnswers.view)
  post('/:prisonerNumber/:id', checkYourAnswers.submit)
  get('/:prisonerNumber/:id/report', checkYourAnswersBeforeChangeReporter.view)
  post('/:prisonerNumber/:id/report', checkYourAnswersBeforeChangeReporter.submit)

  return router
}
