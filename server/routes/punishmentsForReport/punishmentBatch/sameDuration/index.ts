import express, { RequestHandler, Router } from 'express'

import SameDurationPage from './sameDurationPage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function SameDurationRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const page = new SameDurationPage(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.punishmentSameDuration.matchers.start, page.view)
  post(adjudicationUrls.punishmentSameDuration.matchers.start, page.submit)

  return router
}
