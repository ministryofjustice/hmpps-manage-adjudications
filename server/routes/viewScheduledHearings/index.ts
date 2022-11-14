import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ScheduledHearings from './viewScheduledHearings'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function viewScheduledHearingsRoutes({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const scheduledHearingsRoute = new ScheduledHearings(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.viewScheduledHearings.matchers.start, scheduledHearingsRoute.view)
  post(adjudicationUrls.viewScheduledHearings.matchers.start, scheduledHearingsRoute.submit)

  return router
}
