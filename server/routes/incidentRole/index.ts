import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentRoleRoutes from './incidentRole'
import IncidentRoleEditRoutes from './incidentRoleEdit'
import IncidentRoleSubmittedEditRoutes from './incidentRoleSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function prisonerIncidentRoleRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const incidentRoleRoute = new IncidentRoleRoutes(placeOnReportService)
  const incidentRoleEdit = new IncidentRoleEditRoutes(placeOnReportService)
  const incidentRoleSubmittedEdit = new IncidentRoleSubmittedEditRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.incidentRole.matchers.start, incidentRoleRoute.view)
  post(adjudicationUrls.incidentRole.matchers.start, incidentRoleRoute.submit)
  get(adjudicationUrls.incidentRole.matchers.edit, incidentRoleEdit.view)
  post(adjudicationUrls.incidentRole.matchers.edit, incidentRoleEdit.submit)
  get(adjudicationUrls.incidentRole.matchers.submittedEdit, incidentRoleSubmittedEdit.view)
  post(adjudicationUrls.incidentRole.matchers.submittedEdit, incidentRoleSubmittedEdit.submit)

  return router
}
