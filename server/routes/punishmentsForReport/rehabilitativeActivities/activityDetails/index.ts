import express, { RequestHandler, Router } from 'express'

import RehabilitativeActivityDetailsPage from './activityDetailsPage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'

export default function rehabilitativeActivityDetailsRoutes({
  userService,
  punishmentsService,
  rehabBatchSessionService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
  rehabBatchSessionService: RehabBatchSessionService
}): Router {
  const router = express.Router()

  const rehabilitativeActivityDetailsRoute = new RehabilitativeActivityDetailsPage(
    userService,
    punishmentsService,
    rehabBatchSessionService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.rehabilitativeActivityDetails.matchers.start, rehabilitativeActivityDetailsRoute.view)
  post(adjudicationUrls.rehabilitativeActivityDetails.matchers.start, rehabilitativeActivityDetailsRoute.submit)

  return router
}
