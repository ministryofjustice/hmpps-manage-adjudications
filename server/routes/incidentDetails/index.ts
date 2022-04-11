import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentDetailsRoutes from './incidentDetails'
import IncidentDetailsEditRoutes from './incidentDetailsEdit'
import IncidentDetailsSubmittedEditRoutes from './incidentDetailsSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import adjudicationUrls from '../../utils/urlGenerator'

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

  get(adjudicationUrls.incidentDetails.matchers.start, incidentDetailsRoute.view)
  post(adjudicationUrls.incidentDetails.matchers.start, incidentDetailsRoute.submit)
  get(adjudicationUrls.incidentDetails.matchers.edit, incidentDetailsEdit.view)
  post(adjudicationUrls.incidentDetails.matchers.edit, incidentDetailsEdit.submit)
  get(adjudicationUrls.incidentDetails.matchers.submittedEdit, incidentDetailsSubmittedEdit.view)
  post(adjudicationUrls.incidentDetails.matchers.submittedEdit, incidentDetailsSubmittedEdit.submit)

  return router
}
