import express, { RequestHandler, Router } from 'express'

import RehabilitativeActivityDetailsPage from './activityDetailsPage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function rehabilitativeActivityDetailsRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const rehabilitativeActivityDetailsRoute = new RehabilitativeActivityDetailsPage(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.rehabilitativeActivityDetails.matchers.start, rehabilitativeActivityDetailsRoute.view)
  post(adjudicationUrls.rehabilitativeActivityDetails.matchers.start, rehabilitativeActivityDetailsRoute.submit)

  return router
}
