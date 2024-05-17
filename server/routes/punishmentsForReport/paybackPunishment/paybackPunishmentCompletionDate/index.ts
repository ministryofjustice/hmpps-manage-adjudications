import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import PaybackPunishmentCompletionDateRoute from './paybackPunishmentCompletionDate'
import PaybackPunishmentCompletionDateEditRoute from './paybackPunishmentCompletionDateEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function PaybackPunishmentCompletionDateRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const paybackPunishmentCompletionDateRoute = new PaybackPunishmentCompletionDateRoute(userService, punishmentsService)
  const paybackPunishmentCompletionDateEditRoute = new PaybackPunishmentCompletionDateEditRoute(
    userService,
    punishmentsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.paybackPunishmentCompletionDate.matchers.start, paybackPunishmentCompletionDateRoute.view)
  post(adjudicationUrls.paybackPunishmentCompletionDate.matchers.start, paybackPunishmentCompletionDateRoute.submit)
  get(adjudicationUrls.paybackPunishmentCompletionDate.matchers.edit, paybackPunishmentCompletionDateEditRoute.view)
  post(adjudicationUrls.paybackPunishmentCompletionDate.matchers.edit, paybackPunishmentCompletionDateEditRoute.submit)

  return router
}
