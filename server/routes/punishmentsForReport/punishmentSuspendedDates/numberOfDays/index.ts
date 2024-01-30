import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import NumberOfDaysRoute from './numberOfDays'
import NumberOfDaysEditRoute from './numberOfDaysEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function SuspendedPunishmentNumberOfDaysRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const numberOfDaysRoute = new NumberOfDaysRoute(userService, punishmentsService, reportedAdjudicationsService)
  const numberOfDaysEditRoute = new NumberOfDaysEditRoute(userService, punishmentsService, reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.suspendedPunishmentNumberOfDays.matchers.existingPunishment, numberOfDaysRoute.view)
  post(adjudicationUrls.suspendedPunishmentNumberOfDays.matchers.existingPunishment, numberOfDaysRoute.submit)
  get(adjudicationUrls.suspendedPunishmentNumberOfDays.matchers.edit, numberOfDaysEditRoute.view)
  post(adjudicationUrls.suspendedPunishmentNumberOfDays.matchers.edit, numberOfDaysEditRoute.submit)

  return router
}
