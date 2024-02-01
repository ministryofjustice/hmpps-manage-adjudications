import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AdjudicationConsolidatedView from './adjudicationConsolidatedView'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'

export default function adjudicationConsolidatedViewRoutes({
  reportedAdjudicationsService,
  userService,
  decisionTreeService,
  punishmentsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
  decisionTreeService: DecisionTreeService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const adjudicationConsolidatedViewRoute = new AdjudicationConsolidatedView(
    reportedAdjudicationsService,
    userService,
    decisionTreeService,
    punishmentsService
  )
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.prisonerReportConsolidated.matchers.view, adjudicationConsolidatedViewRoute.view)

  return router
}
