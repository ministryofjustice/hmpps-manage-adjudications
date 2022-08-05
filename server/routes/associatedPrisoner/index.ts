import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import IncidentAssistRoutes from './incidentAssist'
import IncidentAssistSubmittedEditRoutes from './incidentAssistSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function prisonerIncidentAssistRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const incidentAssistRoute = new IncidentAssistRoutes(placeOnReportService)
  const incidentAssistSubmittedEdit = new IncidentAssistSubmittedEditRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.incidentAssist.matchers.start, incidentAssistRoute.view)
  post(adjudicationUrls.incidentAssist.matchers.start, incidentAssistRoute.submit)
  get(adjudicationUrls.incidentAssist.matchers.submittedEdit, incidentAssistSubmittedEdit.view)
  post(adjudicationUrls.incidentAssist.matchers.submittedEdit, incidentAssistSubmittedEdit.submit)

  return router
}
