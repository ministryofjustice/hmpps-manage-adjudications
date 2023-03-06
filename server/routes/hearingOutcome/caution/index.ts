import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import CautionRoutes from './caution'
import HearingsService from '../../../services/hearingsService'

export default function cautionRoutes({
  hearingsService,
  userService,
}: {
  hearingsService: HearingsService
  userService: UserService
}): Router {
  const router = express.Router()

  const cautionRoute = new CautionRoutes(hearingsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.isThisACaution.matchers.start, cautionRoute.view)
  post(adjudicationUrls.isThisACaution.matchers.start, cautionRoute.submit)

  return router
}
