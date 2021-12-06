import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrisonerReportRoutes from './prisonerReport'

import PlaceOnReportService from '../../services/placeOnReportService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'

export default function prisonerReportRoutes({
  reportedAdjudicationsService,
  placeOnReportService,
  locationService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  placeOnReportService: PlaceOnReportService
  locationService: LocationService
}): Router {
  const router = express.Router()

  const prisonerReport = new PrisonerReportRoutes(reportedAdjudicationsService, placeOnReportService, locationService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:adjudicationNumber', prisonerReport.view)

  return router
}
