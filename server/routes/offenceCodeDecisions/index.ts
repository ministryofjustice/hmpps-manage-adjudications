import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'
import OffenceCodeDecisionsAloEditRoutes from './offenceCodeDecisionsAloEdit'
import PlaceOnReportService from '../../services/placeOnReportService'
import decisionTree, { paragraph1 } from '../../offenceCodeDecisions/DecisionTree'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchService from '../../services/prisonerSearchService'

export default function offenceCodeDecisionsRoutes({
  placeOnReportService,
  userService,
  decisionTreeService,
  prisonerSearchService,
}: {
  placeOnReportService: PlaceOnReportService
  userService: UserService
  decisionTreeService: DecisionTreeService
  prisonerSearchService: PrisonerSearchService
}): Router {
  const router = express.Router()

  const offenceCodeDecisionsRoute = new OffenceCodeDecisionsRoutes({
    placeOnReportService,
    userService,
    decisionTreeService,
    prisonerSearchService,
  })

  const offenceCodeDecisionsAloEditRoute = new OffenceCodeDecisionsAloEditRoutes({
    placeOnReportService,
    userService,
    decisionTreeService,
    prisonerSearchService,
  })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.offenceCodeSelection.matchers.question(), offenceCodeDecisionsRoute.view)
  post(adjudicationUrls.offenceCodeSelection.matchers.question(), offenceCodeDecisionsRoute.submit)
  get(adjudicationUrls.offenceCodeSelection.matchers.start(), offenceCodeDecisionsRoute.redirectToStart)
  get(adjudicationUrls.offenceCodeSelection.matchers.aloEditQuestion(), offenceCodeDecisionsAloEditRoute.view)
  post(adjudicationUrls.offenceCodeSelection.matchers.aloEditQuestion(), offenceCodeDecisionsAloEditRoute.submit)
  get(adjudicationUrls.offenceCodeSelection.matchers.aloEditStart(), offenceCodeDecisionsAloEditRoute.redirectToStart)

  return router
}
