import express, { RequestHandler, Router } from 'express'

import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import IncompleteRehabilitativeActivity from './incompleteRehabilitativeActivity'

export default function IncompleteRehabilitativeActivityRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const incompleteRehabilitativeActivityRoute = new IncompleteRehabilitativeActivity(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.incompleteRehabilitativeActivity.matchers.start, incompleteRehabilitativeActivityRoute.view)
  post(adjudicationUrls.incompleteRehabilitativeActivity.matchers.start, incompleteRehabilitativeActivityRoute.submit)

  return router
}
