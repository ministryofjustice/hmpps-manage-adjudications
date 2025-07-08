import express, { RequestHandler, Router } from 'express'

import ReportsTransferredAll from './reportsTransferredAll'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default function reportsTransferredAll({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const reportsTransferredAllRoute = new ReportsTransferredAll(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.reportsTransferredAll.matchers.start, reportsTransferredAllRoute.view)
  post(adjudicationUrls.reportsTransferredAll.matchers.start, reportsTransferredAllRoute.submit)

  return router
}
