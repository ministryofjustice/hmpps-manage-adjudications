import express, { RequestHandler, Router } from 'express'

import NumberOfDaysRoute from './numberOfDays'
import NumberOfDaysEditRoute from './numberOfDaysEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function NumberOfDaysRoutes({
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

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.punishmentNumberOfDays.matchers.start, numberOfDaysRoute.view)
  post(adjudicationUrls.punishmentNumberOfDays.matchers.start, numberOfDaysRoute.submit)
  get(adjudicationUrls.punishmentNumberOfDays.matchers.edit, numberOfDaysEditRoute.view)
  post(adjudicationUrls.punishmentNumberOfDays.matchers.edit, numberOfDaysEditRoute.submit)

  return router
}
