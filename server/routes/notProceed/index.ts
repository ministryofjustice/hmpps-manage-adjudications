import express, { RequestHandler, Router } from 'express'
import NotProceedRoutes from './notProceed'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import OutcomesService from '../../services/outcomesService'

export default function notProceedRoutes({
  userService,
  outcomesService,
}: {
  userService: UserService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const notProceedRoute = new NotProceedRoutes(userService, outcomesService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reasonForNotProceeding.matchers.start, notProceedRoute.view)
  post(adjudicationUrls.reasonForNotProceeding.matchers.start, notProceedRoute.submit)

  return router
}
