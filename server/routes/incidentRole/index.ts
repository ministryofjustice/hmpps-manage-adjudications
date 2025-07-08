import express, { RequestHandler, Router } from 'express'

import IncidentRoleRoutes from './incidentRole'
import IncidentRoleSubmittedEditRoutes from './incidentRoleSubmittedEdit'
import IncidentRoleSubmittedEditAloRoutes from './incidentRoleSubmittedEditAlo'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function prisonerIncidentRoleRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const incidentRoleRoute = new IncidentRoleRoutes(placeOnReportService)
  const incidentRoleSubmittedEdit = new IncidentRoleSubmittedEditRoutes(placeOnReportService)
  const incidentRoleSubmittedEditAlo = new IncidentRoleSubmittedEditAloRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.incidentRole.matchers.start, incidentRoleRoute.view)
  post(adjudicationUrls.incidentRole.matchers.start, incidentRoleRoute.submit)
  get(adjudicationUrls.incidentRole.matchers.submittedEdit, incidentRoleSubmittedEdit.view)
  post(adjudicationUrls.incidentRole.matchers.submittedEdit, incidentRoleSubmittedEdit.submit)
  get(adjudicationUrls.incidentRole.matchers.aloSubmittedEdit, incidentRoleSubmittedEditAlo.view)
  post(adjudicationUrls.incidentRole.matchers.aloSubmittedEdit, incidentRoleSubmittedEditAlo.submit)

  return router
}
