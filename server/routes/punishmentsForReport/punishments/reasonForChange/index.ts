import express, { RequestHandler, Router } from 'express'

import PunishmentsService from '../../../../services/punishmentsService'
import UserService from '../../../../services/userService'

import adjudicationUrls from '../../../../utils/urlGenerator'
import ReasonForChangeRoute from './reasonForChange'
import ReasonForChangeEditRoute from './reasonForChangeEdit'

export default function reasonForChangeRoutes({
  punishmentsService,
  userService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
}): Router {
  const router = express.Router()

  const reasonForChangePunishmentRoute = new ReasonForChangeRoute(punishmentsService, userService)
  const ReasonForChangePunishmentEditRoute = new ReasonForChangeEditRoute(punishmentsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.reasonForChangePunishment.matchers.start, reasonForChangePunishmentRoute.view)
  post(adjudicationUrls.reasonForChangePunishment.matchers.start, reasonForChangePunishmentRoute.submit)
  get(adjudicationUrls.reasonForChangePunishment.matchers.edit, ReasonForChangePunishmentEditRoute.view)
  post(adjudicationUrls.reasonForChangePunishment.matchers.edit, ReasonForChangePunishmentEditRoute.submit)

  return router
}
