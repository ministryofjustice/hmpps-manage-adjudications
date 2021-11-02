import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentDetailsRoutes from './incidentDetails'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'

export default function prisonerIncidentStatementsRoutes({
  placeOnReportService,
  locationService,
}: {
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const incidentDetails = new IncidentDetailsRoutes(placeOnReportService, locationService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber', incidentDetails.view)
  post('/:prisonerNumber', incidentDetails.submit)

  return router
}
