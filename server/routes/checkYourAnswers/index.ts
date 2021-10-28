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

  get('/', checkYourAnswers.view)

  return router
}
