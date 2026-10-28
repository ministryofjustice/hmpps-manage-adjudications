import express, { RequestHandler, Router } from 'express'

import PunishmentsService from '../../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../../services/punishmentBatchSessionService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import UserService from '../../../../services/userService'

import adjudicationUrls from '../../../../utils/urlGenerator'
import AwardPunishmentsPage, { PageRequestType } from './awardPunishments'

export default function awardPunishmentsRoutes({
  punishmentsService,
  userService,
  punishmentBatchSessionService,
  rehabBatchSessionService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
  punishmentBatchSessionService: PunishmentBatchSessionService
  rehabBatchSessionService: RehabBatchSessionService
}): Router {
  const router = express.Router()
  const punishmentsUsingApi = new AwardPunishmentsPage(
    PageRequestType.PUNISHMENTS_FROM_API,
    punishmentsService,
    userService,
    punishmentBatchSessionService,
    rehabBatchSessionService,
  )

  const punishmentsUsingSession = new AwardPunishmentsPage(
    PageRequestType.PUNISHMENTS_FROM_SESSION,
    punishmentsService,
    userService,
    punishmentBatchSessionService,
    rehabBatchSessionService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.awardPunishments.matchers.start, punishmentsUsingApi.view)
  get(adjudicationUrls.awardPunishments.matchers.modified, punishmentsUsingSession.view)

  return router
}
