import express, { RequestHandler, Router } from 'express'
import ProsecutionRoutes from './prosecution'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import OutcomesService from '../../services/outcomesService'

export default function prosecutionRoutes({
  userService,
  outcomesService,
}: {
  userService: UserService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const prosecutionRoute = new ProsecutionRoutes(userService, outcomesService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.prosecution.matchers.start, prosecutionRoute.view)
  post(adjudicationUrls.prosecution.matchers.start, prosecutionRoute.submit)

  return router
}
