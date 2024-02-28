import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ReportsTransferredIn from './reportsTransferredIn'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default function reportsTransferredIn({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const reportsTransferredInRoute = new ReportsTransferredIn(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reportsTransferredIn.matchers.start, reportsTransferredInRoute.view)
  post(adjudicationUrls.reportsTransferredIn.matchers.start, reportsTransferredInRoute.submit)

  return router
}
