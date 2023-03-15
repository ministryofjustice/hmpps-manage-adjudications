import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingsService from '../../../services/hearingsService'
import ReasonForFindingRoutes from './reasonForFinding'

export default function reasonForFindingRoutes({
  reportedAdjudicationsService,
  hearingsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  hearingsService: HearingsService
  userService: UserService
}): Router {
  const router = express.Router()

  const reasonForFindingRoute = new ReasonForFindingRoutes(reportedAdjudicationsService, hearingsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingReasonForFinding.matchers.start, reasonForFindingRoute.view)
  post(adjudicationUrls.hearingReasonForFinding.matchers.start, reasonForFindingRoute.submit)

  return router
}
