import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import IsThereRehabilitativeActivityRoutes from './hasRehabilitativeActivityDetails'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function PunishmentRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const isThereRehabilitativeActivityRoute = new IsThereRehabilitativeActivityRoutes(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(
    adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.matchers.start,
    isThereRehabilitativeActivityRoute.view
  )
  post(
    adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.matchers.start,
    isThereRehabilitativeActivityRoute.submit
  )

  return router
}
