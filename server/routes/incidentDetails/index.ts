import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentDetailsRoutes from './incidentDetails'
import IncidentDetailsEditRoutes from './incidentDetailsEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'

export default function prisonerIncidentDetailsRoutes({
  placeOnReportService,
  locationService,
}: {
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const incidentDetails = new IncidentDetailsRoutes(placeOnReportService, locationService)
  const incidentDetailsEdit = new IncidentDetailsEditRoutes(placeOnReportService, locationService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber', incidentDetails.view)
  post('/:prisonerNumber', incidentDetails.submit)
  get('/:prisonerNumber/:id/edit', incidentDetailsEdit.view)
  post('/:prisonerNumber/:id/edit', incidentDetailsEdit.submit)

  return router
}
