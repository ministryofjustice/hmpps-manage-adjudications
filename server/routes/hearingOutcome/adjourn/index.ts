import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import HearingAdjournRoutes from './hearingAdjourn'
import HearingAdjournEditRoutes from './hearingAdjournEdit'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function hearingAdjournedRoutes({
  hearingsService,
  userService,
  reportedAdjudicationsService,
}: {
  hearingsService: HearingsService
  userService: UserService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const hearingAdjournRoute = new HearingAdjournRoutes(hearingsService, userService, reportedAdjudicationsService)
  const hearingAdjournEditRoute = new HearingAdjournEditRoutes(
    hearingsService,
    userService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingAdjourned.matchers.start, hearingAdjournRoute.view)
  post(adjudicationUrls.hearingAdjourned.matchers.start, hearingAdjournRoute.submit)
  get(adjudicationUrls.hearingAdjourned.matchers.edit, hearingAdjournEditRoute.view)
  post(adjudicationUrls.hearingAdjourned.matchers.edit, hearingAdjournEditRoute.submit)

  return router
}
