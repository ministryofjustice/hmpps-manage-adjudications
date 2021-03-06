import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'
import PlaceOnReportService from '../../services/placeOnReportService'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import UserService from '../../services/userService'
import OffenceSessionService from '../../services/offenceSessionService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function offenceCodeDecisionsRoutes({
  placeOnReportService,
  userService,
  offenceSessionService,
  decisionTreeService,
}: {
  placeOnReportService: PlaceOnReportService
  userService: UserService
  offenceSessionService: OffenceSessionService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()
  const offenceCodeDecisions = new OffenceCodeDecisionsRoutes(
    placeOnReportService,
    userService,
    offenceSessionService,
    decisionTreeService
  )
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  Object.keys(IncidentRole).forEach(key => {
    decisionTree.allIds().forEach(id => {
      get(adjudicationUrls.offenceCodeSelection.matchers.question(key as IncidentRole, id), offenceCodeDecisions.view)
      post(
        adjudicationUrls.offenceCodeSelection.matchers.question(key as IncidentRole, id),
        offenceCodeDecisions.submit
      )
    })
    get(adjudicationUrls.offenceCodeSelection.matchers.start(key as IncidentRole), offenceCodeDecisions.redirectToStart)
  })
  return router
}
