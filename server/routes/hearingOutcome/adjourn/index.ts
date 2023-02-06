import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import HearingAdjournRoutes from './hearingAdjourn'
import HearingAdjournEditRoutes from './hearingAdjournEdit'

export default function hearingAdjournedRoutes({
  hearingsService,
  userService,
}: {
  hearingsService: HearingsService
  userService: UserService
}): Router {
  const router = express.Router()

  const hearingAdjournRoute = new HearingAdjournRoutes(hearingsService, userService)
  const hearingAdjournEditRoute = new HearingAdjournEditRoutes(hearingsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingAdjourned.matchers.start, hearingAdjournRoute.view)
  post(adjudicationUrls.hearingAdjourned.matchers.start, hearingAdjournRoute.submit)
  get(adjudicationUrls.hearingAdjourned.matchers.edit, hearingAdjournEditRoute.view)
  post(adjudicationUrls.hearingAdjourned.matchers.edit, hearingAdjournEditRoute.submit)

  return router
}
