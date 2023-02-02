import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import PleaAndFindingRoutes from './pleaAndFinding'
import PleaAndFindingEditRoutes from './pleaAndFindingEdit'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'

export default function pleaAndFindingRoutes({
  userService,
  hearingsService,
}: {
  userService: UserService
  hearingsService: HearingsService
}): Router {
  const router = express.Router()

  const pleaAndFindingRoute = new PleaAndFindingRoutes(userService, hearingsService)
  const pleaAndFindingEditRoute = new PleaAndFindingEditRoutes(userService, hearingsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingPleaAndFinding.matchers.start, pleaAndFindingRoute.view)
  post(adjudicationUrls.hearingPleaAndFinding.matchers.start, pleaAndFindingRoute.submit)
  get(adjudicationUrls.hearingPleaAndFinding.matchers.edit, pleaAndFindingEditRoute.view)
  post(adjudicationUrls.hearingPleaAndFinding.matchers.edit, pleaAndFindingEditRoute.submit)

  return router
}
