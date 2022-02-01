import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import SelectAssociatedPrisonerRoutes from './selectAssociatedPrisoner'

import PrisonerSearchService from '../../services/prisonerSearchService'

export default function selectAssociatedPrisonerRoutes({
  prisonerSearchService,
}: {
  prisonerSearchService: PrisonerSearchService
}): Router {
  const router = express.Router()

  const selectAssociatedPrisoner = new SelectAssociatedPrisonerRoutes(prisonerSearchService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber', selectAssociatedPrisoner.view)
  post('/:prisonerNumber', selectAssociatedPrisoner.submit)

  return router
}
