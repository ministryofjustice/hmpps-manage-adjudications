import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ReportAQuashedGuiltyFindingRoutes from './reportAQuashedGuiltyFinding'
import ReportAQuashedGuiltyFindingEditRoutes from './reportAQuashedGuiltyFindingEdit'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function reportAQuashedGuiltyFindingRoutes({
  userService,
  outcomesService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  outcomesService: OutcomesService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const reportAQuashedGuiltyFindingRoute = new ReportAQuashedGuiltyFindingRoutes(
    userService,
    outcomesService,
    reportedAdjudicationsService
  )
  const reportAQuashedGuiltyFindingEditRoute = new ReportAQuashedGuiltyFindingEditRoutes(
    userService,
    outcomesService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reportAQuashedGuiltyFinding.matchers.start, reportAQuashedGuiltyFindingRoute.view)
  post(adjudicationUrls.reportAQuashedGuiltyFinding.matchers.start, reportAQuashedGuiltyFindingRoute.submit)
  get(adjudicationUrls.reportAQuashedGuiltyFinding.matchers.edit, reportAQuashedGuiltyFindingEditRoute.view)
  post(adjudicationUrls.reportAQuashedGuiltyFinding.matchers.edit, reportAQuashedGuiltyFindingEditRoute.submit)

  return router
}
