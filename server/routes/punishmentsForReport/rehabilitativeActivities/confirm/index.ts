import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import ConfirmRehabCompletePage from './confirm'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function confirmRehabCompleteRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const confirmCompleteRoute = new ConfirmRehabCompletePage(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.confirmCompleteRehabilitativeActivity.matchers.start, confirmCompleteRoute.view)
  post(adjudicationUrls.confirmCompleteRehabilitativeActivity.matchers.start, confirmCompleteRoute.submit)

  return router
}
