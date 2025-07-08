import express, { RequestHandler, Router } from 'express'

import PaybackPunishmentDetailsRoute from './paybackPunishmentDetails'
import PaybackPunishmentDetailsEditRoute from './paybackPunishmentDetailsEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function PaybackPunishmentDetailsRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const paybackPunishmentDetailsRoute = new PaybackPunishmentDetailsRoute(userService, punishmentsService)
  const paybackPunishmentDetailsEditRoute = new PaybackPunishmentDetailsEditRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.paybackPunishmentDetails.matchers.start, paybackPunishmentDetailsRoute.view)
  post(adjudicationUrls.paybackPunishmentDetails.matchers.start, paybackPunishmentDetailsRoute.submit)
  get(adjudicationUrls.paybackPunishmentDetails.matchers.edit, paybackPunishmentDetailsEditRoute.view)
  post(adjudicationUrls.paybackPunishmentDetails.matchers.edit, paybackPunishmentDetailsEditRoute.submit)

  return router
}
