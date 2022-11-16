import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AgeOfPrisonerRoutes from './ageOfPrisoner'
import AgeOfPrisonerSubmittedEditRoutes from './ageOfPrisonerSubmittedEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import AllOffencesSessionService from '../../services/allOffencesSessionService'

export default function ageOfPrisonerRoutes({
  placeOnReportService,
  allOffencesSessionService,
}: {
  placeOnReportService: PlaceOnReportService
  allOffencesSessionService: AllOffencesSessionService
}): Router {
  const router = express.Router()

  const ageOfPrisonerRoute = new AgeOfPrisonerRoutes(placeOnReportService, allOffencesSessionService)
  const ageOfPrisonerSubmittedEditRoute = new AgeOfPrisonerSubmittedEditRoutes(
    placeOnReportService,
    allOffencesSessionService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.ageOfPrisoner.matchers.start, ageOfPrisonerRoute.view)
  post(adjudicationUrls.ageOfPrisoner.matchers.start, ageOfPrisonerRoute.submit)
  get(adjudicationUrls.ageOfPrisoner.matchers.submittedEdit, ageOfPrisonerSubmittedEditRoute.view)
  post(adjudicationUrls.ageOfPrisoner.matchers.submittedEdit, ageOfPrisonerSubmittedEditRoute.submit)
  return router
}
