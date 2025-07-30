import express, { RequestHandler, Router } from 'express'

import PunishmentStartDateChoiceRoute from './startDateChoice'
import PunishmentStartDateChoiceEditRoute from './startDateChoiceEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function SuspendedPunishmentStartDateChoiceRoutes({
  userService,
  punishmentsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const startDateChoiceRoute = new PunishmentStartDateChoiceRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService,
  )
  const startDateChoiceEditRoute = new PunishmentStartDateChoiceEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.existingPunishment, startDateChoiceRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.existingPunishment, startDateChoiceRoute.submit)
  get(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.edit, startDateChoiceEditRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.edit, startDateChoiceEditRoute.submit)

  return router
}
