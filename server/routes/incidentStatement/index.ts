import express, { RequestHandler, Router } from 'express'

import IncidentStatementRoutes from './incidentStatement'
import IncidentStatementSubmittedEditRoutes from './incidentStatementSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function prisonerIncidentStatementsRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const incidentStatementRoute = new IncidentStatementRoutes(placeOnReportService)
  const incidentStatementSubmittedEdit = new IncidentStatementSubmittedEditRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.incidentStatement.matchers.start, incidentStatementRoute.view)
  post(adjudicationUrls.incidentStatement.matchers.start, incidentStatementRoute.submit)
  get(adjudicationUrls.incidentStatement.matchers.submittedEdit, incidentStatementSubmittedEdit.view)
  post(adjudicationUrls.incidentStatement.matchers.submittedEdit, incidentStatementSubmittedEdit.submit)

  return router
}
