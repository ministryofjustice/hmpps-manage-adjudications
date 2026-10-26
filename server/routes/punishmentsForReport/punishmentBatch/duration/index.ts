import express, { Router } from 'express'

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

  router.get(adjudicationUrls.punishmentDuration.matchers.start, page.view)
  router.post(adjudicationUrls.punishmentDuration.matchers.start, page.submit)
  router.get(adjudicationUrls.punishmentDuration.matchers.edit, editPage.view)
  router.post(adjudicationUrls.punishmentDuration.matchers.edit, editPage.submit)

  return router
}
