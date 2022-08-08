import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AssociatedPrisonerRoutes from './associatePrisoner'
import AssociatedPrisonerSubmittedEditRoutes from './associatePrisonerSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchService from '../../services/prisonerSearchService'

export default function prisonerIncidentAssistRoutes({
  placeOnReportService,
  prisonerSearchService,
}: {
  placeOnReportService: PlaceOnReportService
  prisonerSearchService: PrisonerSearchService
}): Router {
  const router = express.Router()

  const associatedPrisonerRoutes = new AssociatedPrisonerRoutes(placeOnReportService, prisonerSearchService)
  const associatedPrisonerSubmittedEditRoutes = new AssociatedPrisonerSubmittedEditRoutes(
    placeOnReportService,
    prisonerSearchService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.incidentAssociate.matchers.start, associatedPrisonerRoutes.view)
  post(adjudicationUrls.incidentAssociate.matchers.start, associatedPrisonerRoutes.submit)
  get(adjudicationUrls.incidentAssociate.matchers.submittedEdit, associatedPrisonerSubmittedEditRoutes.view)
  post(adjudicationUrls.incidentAssociate.matchers.submittedEdit, associatedPrisonerSubmittedEditRoutes.submit)

  return router
}
