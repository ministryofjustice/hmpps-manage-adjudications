import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import HearingDetailsCreationRoute from './hearingDetails'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function HearingDetailsRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const hearingDetailsRoute = new HearingDetailsCreationRoute(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingDetails.matchers.start, hearingDetailsRoute.view)
  post(adjudicationUrls.hearingDetails.matchers.start, hearingDetailsRoute.submit)

  return router
}
