import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AgeOfPrisonerRoutes from './ageOfPrisoner'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function CheckAnswersRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const ageOfPrisonerRoute = new AgeOfPrisonerRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.ageOfPrisoner.matchers.start, ageOfPrisonerRoute.view)
  post(adjudicationUrls.ageOfPrisoner.matchers.start, ageOfPrisonerRoute.submit)
  return router
}
