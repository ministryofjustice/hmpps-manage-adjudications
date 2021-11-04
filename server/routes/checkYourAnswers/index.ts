import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CheckYourAnswersRoutes from './checkYourAnswers'

import PlaceOnReportService from '../../services/placeOnReportService'

export default function CheckAnswersRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const checkYourAnswers = new CheckYourAnswersRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:id', checkYourAnswers.view)
  post('/:prisonerNumber/:id', checkYourAnswers.view)

  return router
}
