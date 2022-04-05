import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrisonerSelectRoutes from './prisonerSelect'

import PrisonerSearchService from '../../services/prisonerSearchService'
import { selectPrisoner } from '../../utils/urlGenerator'

export default function selectPrisonerRoutes({
  prisonerSearchService,
}: {
  prisonerSearchService: PrisonerSearchService
}): Router {
  const router = express.Router()

  const prisonerSelect = new PrisonerSelectRoutes(prisonerSearchService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(selectPrisoner.matchers.start, prisonerSelect.view)
  post(selectPrisoner.matchers.start, prisonerSelect.submit)

  return router
}
