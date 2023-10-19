import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'
import OffenceCodeDecisionsAloEditRoutes from './offenceCodeDecisionsAloEdit'
import PlaceOnReportService from '../../services/placeOnReportService'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchService from '../../services/prisonerSearchService'
import OffenceListRoute from './offenceListPage'

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

  const offenceListRoute = new OffenceListRoute(placeOnReportService, userService, decisionTreeService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  Object.keys(IncidentRole).forEach(key => {
    decisionTree.allIds().forEach(id => {
      get(
        adjudicationUrls.offenceCodeSelection.matchers.question(key as IncidentRole, id),
        offenceCodeDecisionsRoute.view
      )
      post(
        adjudicationUrls.offenceCodeSelection.matchers.question(key as IncidentRole, id),
        offenceCodeDecisionsRoute.submit
      )
    })
    get(
      adjudicationUrls.offenceCodeSelection.matchers.start(key as IncidentRole),
      offenceCodeDecisionsRoute.redirectToStart
    )
  })
  Object.keys(IncidentRole).forEach(key => {
    decisionTree.allIds().forEach(id => {
      get(
        adjudicationUrls.offenceCodeSelection.matchers.aloEditQuestion(key as IncidentRole, id),
        offenceCodeDecisionsAloEditRoute.view
      )
      post(
        adjudicationUrls.offenceCodeSelection.matchers.aloEditQuestion(key as IncidentRole, id),
        offenceCodeDecisionsAloEditRoute.submit
      )
    })
    get(
      adjudicationUrls.offenceCodeSelection.matchers.aloEditStart(key as IncidentRole),
      offenceCodeDecisionsAloEditRoute.redirectToStart
    )
    get(adjudicationUrls.offenceCodeSelection.matchers.list(key as IncidentRole), offenceListRoute.view)
    post(adjudicationUrls.offenceCodeSelection.matchers.list(key as IncidentRole), offenceListRoute.submit)
  })

  return router
}
