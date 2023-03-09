import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ReportAQuashedGuiltyFindingRoutes from './reportAQuashedGuiltyFinding'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'

export default function reportAQuashedGuiltyFindingRoutes({
  userService,
  outcomesService,
}: {
  userService: UserService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const reportAQuashedGuiltyFindingRoute = new ReportAQuashedGuiltyFindingRoutes(userService, outcomesService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reportAQuashedGuiltyFinding.matchers.start, reportAQuashedGuiltyFindingRoute.view)
  post(adjudicationUrls.reportAQuashedGuiltyFinding.matchers.start, reportAQuashedGuiltyFindingRoute.submit)

  return router
}
