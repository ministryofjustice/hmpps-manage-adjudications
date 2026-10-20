import express, { RequestHandler, Router } from 'express'

import DurationPage, { PageRequestType } from './durationPage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function DurationRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const page = new DurationPage(PageRequestType.CREATION, userService, punishmentsService)
  const editPage = new DurationPage(PageRequestType.EDIT, userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.punishmentDuration.matchers.start, page.view)
  post(adjudicationUrls.punishmentDuration.matchers.start, page.submit)
  get(adjudicationUrls.punishmentDuration.matchers.edit, editPage.view)
  post(adjudicationUrls.punishmentDuration.matchers.edit, editPage.submit)

  return router
}
