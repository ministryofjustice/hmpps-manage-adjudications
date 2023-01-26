import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import ScheduleHearingRoutes from './scheduleHearing'
import ScheduleHearingEditRoutes from './scheduleHearingEdit'

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
  const scheduleHearingEditRoute = new ScheduleHearingEditRoutes(
    reportedAdjudicationsService,
    locationService,
    userService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.scheduleHearing.matchers.start, scheduleHearingRoute.view)
  post(adjudicationUrls.scheduleHearing.matchers.start, scheduleHearingRoute.submit)
  get(adjudicationUrls.scheduleHearing.matchers.edit, scheduleHearingEditRoute.view)
  post(adjudicationUrls.scheduleHearing.matchers.edit, scheduleHearingEditRoute.submit)

  return router
}
