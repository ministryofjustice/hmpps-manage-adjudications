import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import PunishmentStartDateChoiceRoute from './startDateChoice'
import PunishmentStartDateChoiceEditRoute from './startDateChoiceEdit'
import PunishmentStartDateChoiceManualRoute from './startDateChoiceManual'
import PunishmentStartDateChoiceManualEditRoute from './startDateChoiceManualEdit'

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
    reportedAdjudicationsService
  )
  const startDateChoiceEditRoute = new PunishmentStartDateChoiceEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )
  const startDateChoiceManualRoute = new PunishmentStartDateChoiceManualRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )
  const startDateChoiceManualEditRoute = new PunishmentStartDateChoiceManualEditRoute(
    userService,
    punishmentsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.existingPunishment, startDateChoiceRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.existingPunishment, startDateChoiceRoute.submit)
  get(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.edit, startDateChoiceEditRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.edit, startDateChoiceEditRoute.submit)
  get(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.manualPunishment, startDateChoiceManualRoute.view)
  post(adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.manualPunishment, startDateChoiceManualRoute.submit)
  get(
    adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.manualPunishmentEdit,
    startDateChoiceManualEditRoute.view
  )
  post(
    adjudicationUrls.suspendedPunishmentStartDateChoice.matchers.manualPunishmentEdit,
    startDateChoiceManualEditRoute.submit
  )

  return router
}
