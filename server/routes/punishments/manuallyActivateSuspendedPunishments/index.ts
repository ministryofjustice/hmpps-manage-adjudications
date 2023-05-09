import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import PunishmentsService from '../../../services/punishmentsService'
import UserService from '../../../services/userService'

import adjudicationUrls from '../../../utils/urlGenerator'
import ManuallyActivateSuspendedPunishmentsRoute from './manuallyActivateSuspendedPunishment'

export default function manuallyActivateSuspendedPunishmentsRoutes({
  punishmentsService,
  userService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
}): Router {
  const router = express.Router()
  const manuallyActivateSuspendedPunishmentsRoute = new ManuallyActivateSuspendedPunishmentsRoute(
    punishmentsService,
    userService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(
    adjudicationUrls.manuallyActivateSuspendedPunishment.matchers.start,
    manuallyActivateSuspendedPunishmentsRoute.view
  )
  post(
    adjudicationUrls.manuallyActivateSuspendedPunishment.matchers.start,
    manuallyActivateSuspendedPunishmentsRoute.submit
  )

  return router
}
