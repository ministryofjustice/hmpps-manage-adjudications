import express, { RequestHandler, Router } from 'express'

import AssociatedPrisonerRoutes from './associatedPrisoner'
import AssociatedPrisonerSubmittedEditRoutes from './associatedPrisonerSubmittedEdit'
import AssociatedPrisonerAloEditRoutes from './associatedPrisonerAloEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchService from '../../services/prisonerSearchService'

export default function prisonerAssociatedPrisonerRoutes({
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
  const associatedPrisonerAloEditRoutes = new AssociatedPrisonerAloEditRoutes(
    placeOnReportService,
    prisonerSearchService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.incidentAssociate.matchers.start, associatedPrisonerRoutes.view)
  post(adjudicationUrls.incidentAssociate.matchers.start, associatedPrisonerRoutes.submit)
  get(adjudicationUrls.incidentAssociate.matchers.submittedEdit, associatedPrisonerSubmittedEditRoutes.view)
  post(adjudicationUrls.incidentAssociate.matchers.submittedEdit, associatedPrisonerSubmittedEditRoutes.submit)
  get(adjudicationUrls.incidentAssociate.matchers.aloEdit, associatedPrisonerAloEditRoutes.view)
  post(adjudicationUrls.incidentAssociate.matchers.aloEdit, associatedPrisonerAloEditRoutes.submit)

  return router
}
