import express, { RequestHandler, Router } from 'express'

import PunishmentsService from '../../../../services/punishmentsService'
import UserService from '../../../../services/userService'

import adjudicationUrls from '../../../../utils/urlGenerator'
import AwardPunishmentsPage, { PageRequestType } from './awardPunishments'

export default function awardPunishmentsRoutes({
  punishmentsService,
  userService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
}): Router {
  const router = express.Router()
  const punishmentsUsingApi = new AwardPunishmentsPage(
    PageRequestType.PUNISHMENTS_FROM_API,
    punishmentsService,
    userService,
  )

  const punishmentsUsingSession = new AwardPunishmentsPage(
    PageRequestType.PUNISHMENTS_FROM_SESSION,
    punishmentsService,
    userService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.awardPunishments.matchers.start, punishmentsUsingApi.view)
  get(adjudicationUrls.awardPunishments.matchers.modified, punishmentsUsingSession.view)

  return router
}
