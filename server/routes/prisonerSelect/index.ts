import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrisonerSelectRoutes from './prisonerSelect'

import PrisonerSearchService from '../../services/prisonerSearchService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function selectPrisonerRoutes({
  prisonerSearchService,
  userService,
}: {
  prisonerSearchService: PrisonerSearchService
  userService: UserService
}): Router {
  const router = express.Router()

  const prisonerSelect = new PrisonerSelectRoutes(prisonerSearchService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.selectPrisoner.matchers.start, prisonerSelect.view)
  post(adjudicationUrls.selectPrisoner.matchers.start, prisonerSelect.submit)

  return router
}
