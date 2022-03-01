import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'
import PlaceOnReportService from '../../services/placeOnReportService'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import UserService from '../../services/userService'
import OffenceSessionService from '../../services/offenceSessionService'
import DecisionTreeService from '../../services/decisionTreeService'

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
    decisionTree.allUrls().forEach(url => {
      get(`/:adjudicationNumber/:incidentRole(${IncidentRole[key]})/${url}`, offenceCodeDecisions.view)
      post(`/:adjudicationNumber/:incidentRole(${IncidentRole[key]})/${url}`, offenceCodeDecisions.submit)
    })
    get(`/:adjudicationNumber/:incidentRole(${IncidentRole[key]})/`, offenceCodeDecisions.redirectToRoot)
  })
  return router
}
