import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import EnterHearingOutcomeRoutes from './enterHearingOutcome'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'

export default function enterHearingOutcomeRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const enterHearingOutcomeRoute = new EnterHearingOutcomeRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.enterHearingOutcome.matchers.start, enterHearingOutcomeRoute.view)
  post(adjudicationUrls.enterHearingOutcome.matchers.start, enterHearingOutcomeRoute.submit)

  return router
}
