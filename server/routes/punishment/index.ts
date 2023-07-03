import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PunishmentRoute from './punishment'
import PunishmentEditRoute from './punishmentEdit'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function PunishmentRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const punishmentRoute = new PunishmentRoute(userService, punishmentsService, reportedAdjudicationsService)
  const punishmentEditRoute = new PunishmentEditRoute(userService, punishmentsService, reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishment.matchers.start, punishmentRoute.view)
  post(adjudicationUrls.punishment.matchers.start, punishmentRoute.submit)
  get(adjudicationUrls.punishment.matchers.edit, punishmentEditRoute.view)
  post(adjudicationUrls.punishment.matchers.edit, punishmentEditRoute.submit)

  return router
}
