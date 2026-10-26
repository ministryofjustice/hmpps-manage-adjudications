import express, { Router } from 'express'

import SameActivityPage from './sameActivityPage'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function SameActivityRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const page = new SameActivityPage(userService, punishmentsService)

  router.get(adjudicationUrls.sameRehabilitativeActivity.matchers.start, page.view)
  router.post(adjudicationUrls.sameRehabilitativeActivity.matchers.start, page.submit)

  return router
}
