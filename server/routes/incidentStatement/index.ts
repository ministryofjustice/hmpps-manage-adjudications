import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentStatementRoutes from './incidentStatement'
import IncidentStatementSubmittedEditRoutes from './incidentStatementSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import { incidentStatementUrls } from '../../utils/urlGenerator'

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

  get(incidentStatementUrls.matchers.start, incidentStatementRoute.view)
  post(incidentStatementUrls.matchers.start, incidentStatementRoute.submit)
  get(incidentStatementUrls.matchers.submittedEdit, incidentStatementSubmittedEdit.view)
  post(incidentStatementUrls.matchers.submittedEdit, incidentStatementSubmittedEdit.submit)

  return router
}
