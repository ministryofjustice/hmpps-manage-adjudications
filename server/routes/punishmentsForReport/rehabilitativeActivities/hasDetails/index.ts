import express, { RequestHandler, Router } from 'express'

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

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(
    adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.matchers.start,
    isThereRehabilitativeActivityRoute.view,
  )
  post(
    adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.matchers.start,
    isThereRehabilitativeActivityRoute.submit,
  )

  return router
}
