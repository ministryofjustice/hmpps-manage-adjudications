import express, { RequestHandler, Router } from 'express'

import CheckPunishmentsRoute from './checkPunishments'
import CheckPunishmentsSubmittedEditRoute from './checkPunishmentsSubmittedEdit'

import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import UserService from '../../../../services/userService'

export default function CheckPunishmentRoutes({
  punishmentsService,
  userService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
}): Router {
  const router = express.Router()

  const checkPunishmentRoute = new CheckPunishmentsRoute(punishmentsService, userService)
  const checkPunishmentSubmittedEditRoute = new CheckPunishmentsSubmittedEditRoute(punishmentsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.checkPunishments.matchers.start, checkPunishmentRoute.view)
  post(adjudicationUrls.checkPunishments.matchers.start, checkPunishmentRoute.submit)
  get(adjudicationUrls.checkPunishments.matchers.submittedEdit, checkPunishmentSubmittedEditRoute.view)
  post(adjudicationUrls.checkPunishments.matchers.submittedEdit, checkPunishmentSubmittedEditRoute.submit)

  return router
}
