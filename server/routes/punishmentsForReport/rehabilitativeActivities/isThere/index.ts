import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import IsThereRehabilitativeActivityRoutes from './isThereRehabilitativeActivity'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'

export default function PunishmentRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const isThereRehabilitativeActivityRoute = new IsThereRehabilitativeActivityRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishmentHasRehabilitativeActivities.matchers.start, isThereRehabilitativeActivityRoute.view)
  post(adjudicationUrls.punishmentHasRehabilitativeActivities.matchers.start, isThereRehabilitativeActivityRoute.submit)

  return router
}
