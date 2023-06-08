import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IsPrisonerStillInEstablishmentRoutes from './isPrisonerStillInEstablishment'

import adjudicationUrls from '../../utils/urlGenerator'

export default function isPrisonerStillInEstablishmentRoutes(): Router {
  const router = express.Router()

  const isPrisonerStillInEstablishmentRoute = new IsPrisonerStillInEstablishmentRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.isPrisonerStillInEstablishment.matchers.start, isPrisonerStillInEstablishmentRoute.view)
  post(adjudicationUrls.isPrisonerStillInEstablishment.matchers.start, isPrisonerStillInEstablishmentRoute.submit)
  return router
}
