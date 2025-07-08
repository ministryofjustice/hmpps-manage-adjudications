import express, { RequestHandler, Router } from 'express'

import AcceptedReportConfirmationRoute from './acceptedReportConfirmation'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function acceptedReportConfRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const acceptedReportConfirmationRoute = new AcceptedReportConfirmationRoute(reportedAdjudicationsService)
  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.acceptedReportConfirmation.matchers.start, acceptedReportConfirmationRoute.view)
  return router
}
