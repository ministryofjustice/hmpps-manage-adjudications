import express, { RequestHandler, Router } from 'express'

import EnterHearingOutcomeRoutes from './enterHearingOutcome'
import EnterHearingOutcomeEditRoutes from './enterHearingOutcomeEdit'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'

export default function enterHearingOutcomeRoutes({
  userService,
  hearingsService,
}: {
  userService: UserService
  hearingsService: HearingsService
}): Router {
  const router = express.Router()

  const enterHearingOutcomeRoute = new EnterHearingOutcomeRoutes(userService, hearingsService)
  const enterHearingOutcomeEditRoute = new EnterHearingOutcomeEditRoutes(userService, hearingsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.enterHearingOutcome.matchers.start, enterHearingOutcomeRoute.view)
  post(adjudicationUrls.enterHearingOutcome.matchers.start, enterHearingOutcomeRoute.submit)
  get(adjudicationUrls.enterHearingOutcome.matchers.edit, enterHearingOutcomeEditRoute.view)
  post(adjudicationUrls.enterHearingOutcome.matchers.edit, enterHearingOutcomeEditRoute.submit)

  return router
}
