import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import SelectAssociatedPrisonerRoutes from './selectAssociatedPrisoner'

import PrisonerSearchService from '../../services/prisonerSearchService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function selectAssociatedPrisonerRoutes({
  prisonerSearchService,
}: {
  prisonerSearchService: PrisonerSearchService
}): Router {
  const router = express.Router()

  const selectAssociatedPrisonerRoute = new SelectAssociatedPrisonerRoutes(prisonerSearchService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.selectAssociatedPrisoner.matchers.start, selectAssociatedPrisonerRoute.view)
  post(adjudicationUrls.selectAssociatedPrisoner.matchers.start, selectAssociatedPrisonerRoute.submit)

  return router
}
