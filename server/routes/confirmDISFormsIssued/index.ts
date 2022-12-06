import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ConfirmDISFormsIssued from './confirmDISFormsIssued'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function confirmDISFormsIssuedRoutes({
  reportedAdjudicationsService,
  locationService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const confirmDISFormsIssuedRoute = new ConfirmDISFormsIssued(reportedAdjudicationsService, locationService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.confirmDISFormsIssued.matchers.start, confirmDISFormsIssuedRoute.view)
  post(adjudicationUrls.confirmDISFormsIssued.matchers.start, confirmDISFormsIssuedRoute.submit)

  return router
}
