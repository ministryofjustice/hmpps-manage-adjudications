import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrintCompletedDISForms from './printCompletedDISForms'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function printCompletedDISFormsRoutes({
  reportedAdjudicationsService,
  locationService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const printCompletedDISFormsRoute = new PrintCompletedDISForms(reportedAdjudicationsService, locationService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.printCompletedDisForms.matchers.start, printCompletedDISFormsRoute.view)
  post(adjudicationUrls.printCompletedDisForms.matchers.start, printCompletedDISFormsRoute.submit)

  return router
}
