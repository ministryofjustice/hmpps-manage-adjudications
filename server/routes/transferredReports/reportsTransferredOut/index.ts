import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ReportsTransferredOut from './reportsTransferredOut'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default function reportsTransferredOut({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const reportsTransferredOutRoute = new ReportsTransferredOut(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reportsTransferredOut.matchers.start, reportsTransferredOutRoute.view)
  post(adjudicationUrls.reportsTransferredOut.matchers.start, reportsTransferredOutRoute.submit)

  return router
}
