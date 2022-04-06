import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentDetailsRoutes from './incidentDetails'
import IncidentDetailsEditRoutes from './incidentDetailsEdit'
import IncidentDetailsSubmittedEditRoutes from './incidentDetailsSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import { incidentDetails } from '../../utils/urlGenerator'

export default function prisonerIncidentDetailsRoutes({
  placeOnReportService,
  locationService,
}: {
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const incidentDetailsRoute = new IncidentDetailsRoutes(placeOnReportService, locationService)
  const incidentDetailsEdit = new IncidentDetailsEditRoutes(placeOnReportService, locationService)
  const incidentDetailsSubmittedEdit = new IncidentDetailsSubmittedEditRoutes(placeOnReportService, locationService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(incidentDetails.matchers.start, incidentDetailsRoute.view)
  post(incidentDetails.matchers.start, incidentDetailsRoute.submit)
  get(incidentDetails.matchers.edit, incidentDetailsEdit.view)
  post(incidentDetails.matchers.edit, incidentDetailsEdit.submit)
  get(incidentDetails.matchers.submittedEdit, incidentDetailsSubmittedEdit.view)
  post(incidentDetails.matchers.submittedEdit, incidentDetailsSubmittedEdit.submit)

  return router
}
