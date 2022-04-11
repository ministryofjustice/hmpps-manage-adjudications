import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentStatementRoutes from './incidentStatement'
import IncidentStatementSubmittedEditRoutes from './incidentStatementSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import { incidentStatement } from '../../utils/urlGenerator'

export default function prisonerIncidentStatementsRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const incidentStatementRoute = new IncidentStatementRoutes(placeOnReportService)
  const incidentStatementSubmittedEdit = new IncidentStatementSubmittedEditRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(incidentStatement.matchers.start, incidentStatementRoute.view)
  post(incidentStatement.matchers.start, incidentStatementRoute.submit)
  get(incidentStatement.matchers.submittedEdit, incidentStatementSubmittedEdit.view)
  post(incidentStatement.matchers.submittedEdit, incidentStatementSubmittedEdit.submit)

  return router
}
