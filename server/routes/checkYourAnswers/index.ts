import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CheckYourAnswersRoutes from './checkYourAnswers'
import CheckYourAnswersBeforeChangeReporterRoutes from './checkYourAnswersBeforeChangeReporter'
import CheckYourAnswersBeforeChangeReviewerRoutes from './checkYourAnswersBeforeChangeReviewer'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import DecisionTreeService from '../../services/decisionTreeService'

export default function CheckAnswersRoutes({
  placeOnReportService,
  locationService,
  userService,
  allOffencesSessionService,
  decisionTreeService,
}: {
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
  userService: UserService
  allOffencesSessionService: AllOffencesSessionService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const checkYourAnswers = new CheckYourAnswersRoutes(
    placeOnReportService,
    locationService,
    userService,
    allOffencesSessionService,
    decisionTreeService
  )
  const checkYourAnswersBeforeChangeReviewerRoutes = new CheckYourAnswersBeforeChangeReviewerRoutes(
    placeOnReportService,
    locationService
  )
  const checkYourAnswersBeforeChangeReporter = new CheckYourAnswersBeforeChangeReporterRoutes(
    placeOnReportService,
    locationService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:adjudicationNumber', checkYourAnswers.view)
  post('/:prisonerNumber/:adjudicationNumber', checkYourAnswers.submit)
  get('/:prisonerNumber/:id/report', checkYourAnswersBeforeChangeReporter.view)
  post('/:prisonerNumber/:id/report', checkYourAnswersBeforeChangeReporter.submit)
  get('/:prisonerNumber/:id/review', checkYourAnswersBeforeChangeReviewerRoutes.view)
  post('/:prisonerNumber/:id/review', checkYourAnswersBeforeChangeReviewerRoutes.submit)

  return router
}
