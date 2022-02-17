import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'
import PlaceOnReportService from '../../services/placeOnReportService'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import UserService from '../../services/userService'

export default function offenceCodeDecisionsRoutes({
  placeOnReportService,
  userService,
}: {
  placeOnReportService: PlaceOnReportService
  userService: UserService
}): Router {
  const router = express.Router()
  const offenceCodeDecisions = new OffenceCodeDecisionsRoutes(placeOnReportService, userService)
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  Object.keys(IncidentRole).forEach(key => {
    decisionTree.allUrls().forEach(url => {
      get(`/:adjudicationNumber/:incidentRole(${IncidentRole[key]})/${url}`, offenceCodeDecisions.view)
      post(`/:adjudicationNumber/:incidentRole(${IncidentRole[key]})/${url}`, offenceCodeDecisions.submit)
    })
  })
  return router
}
