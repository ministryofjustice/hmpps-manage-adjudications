import express, { RequestHandler, Router } from 'express'

import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'
import OffenceCodeDecisionsAloEditRoutes from './offenceCodeDecisionsAloEdit'
import PlaceOnReportService from '../../services/placeOnReportService'
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

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.offenceCodeSelection.matchers.list(), offenceListRoute.view)
  post(adjudicationUrls.offenceCodeSelection.matchers.list(), offenceListRoute.submit)
  get(adjudicationUrls.offenceCodeSelection.matchers.question(), offenceCodeDecisionsRoute.view)
  post(adjudicationUrls.offenceCodeSelection.matchers.question(), offenceCodeDecisionsRoute.submit)
  get(adjudicationUrls.offenceCodeSelection.matchers.start(), offenceCodeDecisionsRoute.redirectToStart)
  get(adjudicationUrls.offenceCodeSelection.matchers.aloEditQuestion(), offenceCodeDecisionsAloEditRoute.view)
  post(adjudicationUrls.offenceCodeSelection.matchers.aloEditQuestion(), offenceCodeDecisionsAloEditRoute.submit)

  return router
}
