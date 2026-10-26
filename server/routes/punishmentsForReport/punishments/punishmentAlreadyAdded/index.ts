import express, { RequestHandler, Router } from 'express'

import PunishmentAlreadyAddedPage from './punishmentAlreadyAddedPage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function punishmentAlreadyAddedRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const page = new PunishmentAlreadyAddedPage(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.punishmentAlreadyAdded.matchers.start, page.view)
  post(adjudicationUrls.punishmentAlreadyAdded.matchers.start, page.submit)

  return router
}
