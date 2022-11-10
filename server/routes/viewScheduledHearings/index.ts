import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ScheduledHearings from './viewScheduledHearings'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import LocationService from '../../services/locationService'

export default function viewScheduledHearingsRoutes({
  reportedAdjudicationsService,
  locationService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  locationService: LocationService
  userService: UserService
}): Router {
  const router = express.Router()

  const scheduledHearingsRoute = new ScheduledHearings(reportedAdjudicationsService, locationService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.viewScheduledHearings.matchers.start, scheduledHearingsRoute.view)

  return router
}
