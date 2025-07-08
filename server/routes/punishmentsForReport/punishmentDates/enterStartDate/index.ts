import express, { RequestHandler, Router } from 'express'

import EnterStartDateRoute from './enterStartDate'
import EnterStartDateEditRoute from './enterStartDateEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function EnterStartDateRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const enterStartDateRoute = new EnterStartDateRoute(userService, punishmentsService, reportedAdjudicationsService)
  const enterStartDateEditRoute = new EnterStartDateEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.punishmentStartDate.matchers.start, enterStartDateRoute.view)
  post(adjudicationUrls.punishmentStartDate.matchers.start, enterStartDateRoute.submit)
  get(adjudicationUrls.punishmentStartDate.matchers.edit, enterStartDateEditRoute.view)
  post(adjudicationUrls.punishmentStartDate.matchers.edit, enterStartDateEditRoute.submit)

  return router
}
