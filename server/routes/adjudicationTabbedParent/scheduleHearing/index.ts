import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ScheduleHearingRoutes from './scheduleHearing'
import AmendHearingRoutes from './amendHearing'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default function scheduleHearingRoutes({
  reportedAdjudicationsService,
  locationService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  locationService: LocationService
  userService: UserService
}): Router {
  const router = express.Router()

  const scheduleHearingRoute = new ScheduleHearingRoutes(reportedAdjudicationsService, locationService, userService)
  const amendHearingRoute = new AmendHearingRoutes(reportedAdjudicationsService, locationService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.scheduleHearing.matchers.start, scheduleHearingRoute.view)
  post(adjudicationUrls.scheduleHearing.matchers.start, scheduleHearingRoute.submit)
  get(adjudicationUrls.scheduleHearing.matchers.edit, amendHearingRoute.view)
  post(adjudicationUrls.scheduleHearing.matchers.edit, amendHearingRoute.submit)

  return router
}
