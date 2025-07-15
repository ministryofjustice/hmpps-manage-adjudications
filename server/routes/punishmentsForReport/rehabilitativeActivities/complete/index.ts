import express, { RequestHandler, Router } from 'express'

import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import CompleteRehabilitativeActivity from './completeRehabilitativeActivity'

export default function CompleteRehabilitativeActivityRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const completeRehabilitativeActivityRoute = new CompleteRehabilitativeActivity(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.completeRehabilitativeActivity.matchers.start, completeRehabilitativeActivityRoute.view)
  post(adjudicationUrls.completeRehabilitativeActivity.matchers.start, completeRehabilitativeActivityRoute.submit)

  return router
}
