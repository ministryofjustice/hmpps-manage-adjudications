import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import RemoveRehabilitativeActivityRoutes from './removeActivity'

export default function RehabilitativeActivityRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const removeRehabilitativeActivityRoute = new RemoveRehabilitativeActivityRoutes(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.removeRehabilitativeActivity.matchers.start, removeRehabilitativeActivityRoute.view)
  post(adjudicationUrls.removeRehabilitativeActivity.matchers.start, removeRehabilitativeActivityRoute.submit)

  return router
}
