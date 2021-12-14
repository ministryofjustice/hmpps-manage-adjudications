import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentStatementRoutes from './incidentStatement'
import IncidentStatementSubmittedEditRoutes from './incidentStatementSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'

export default function prisonerIncidentStatementsRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const incidentStatement = new IncidentStatementRoutes(placeOnReportService)
  const incidentStatementSubmittedEdit = new IncidentStatementSubmittedEditRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:id', incidentStatement.view)
  post('/:prisonerNumber/:id', incidentStatement.submit)
  get('/:prisonerNumber/:id/submitted/edit', incidentStatementSubmittedEdit.view)
  post('/:prisonerNumber/:id/submitted/edit', incidentStatementSubmittedEdit.submit)

  return router
}
