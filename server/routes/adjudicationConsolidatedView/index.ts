import express, { RequestHandler, Router } from 'express'

import AdjudicationConsolidatedView from './adjudicationConsolidatedView'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'

export default function adjudicationConsolidatedViewRoutes({
  reportedAdjudicationsService,
  decisionTreeService,
  punishmentsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  decisionTreeService: DecisionTreeService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const adjudicationConsolidatedViewRoute = new AdjudicationConsolidatedView(
    reportedAdjudicationsService,
    decisionTreeService,
    punishmentsService,
  )
  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.prisonerReportConsolidated.matchers.view, adjudicationConsolidatedViewRoute.view)

  return router
}
