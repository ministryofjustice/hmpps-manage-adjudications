import express, { RequestHandler, Router } from 'express'

import PunishmentsService from '../../../../services/punishmentsService'
import UserService from '../../../../services/userService'

import adjudicationUrls from '../../../../utils/urlGenerator'
import ActivateSuspendedPunishmentsRoute from './activateSuspendedPunishments'

export default function activateSuspendedPunishmentsRoutes({
  punishmentsService,
  userService,
}: {
  punishmentsService: PunishmentsService
  userService: UserService
}): Router {
  const router = express.Router()
  const activateSuspendedPunishmentsRoute = new ActivateSuspendedPunishmentsRoute(punishmentsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.activateSuspendedPunishments.matchers.start, activateSuspendedPunishmentsRoute.view)
  post(adjudicationUrls.activateSuspendedPunishments.matchers.start, activateSuspendedPunishmentsRoute.submit)

  return router
}
