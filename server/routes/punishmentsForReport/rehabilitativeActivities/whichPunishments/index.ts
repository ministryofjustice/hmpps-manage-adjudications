import express, { Router } from 'express'

import WhichPunishmentsPage from './whichPunishmentsPage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function WhichPunishmentsRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const page = new WhichPunishmentsPage(userService, punishmentsService)

  router.get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.matchers.start, page.view)
  router.post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.matchers.start, page.submit)

  return router
}
