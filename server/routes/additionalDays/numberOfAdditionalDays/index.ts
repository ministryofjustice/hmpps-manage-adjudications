import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import NumberOfAdditionalDaysRoute from './numberOfAdditionalDays'
import NumberOfAdditionalDaysEditRoute from './numberOfAdditionalDaysEdit'
import NumberOfAdditionalDaysManualEdit from './numberOfAdditionalDaysManualEdit'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'

export default function NumberOfAdditionalDaysRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const numberOfAdditionalDaysRoute = new NumberOfAdditionalDaysRoute(userService, punishmentsService)
  const numberOfAdditionalDaysEditRoute = new NumberOfAdditionalDaysEditRoute(userService, punishmentsService)
  const numberOfAdditionalDaysManualEditRoute = new NumberOfAdditionalDaysManualEdit(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.numberOfAdditionalDays.matchers.start, numberOfAdditionalDaysRoute.view)
  post(adjudicationUrls.numberOfAdditionalDays.matchers.start, numberOfAdditionalDaysRoute.submit)
  get(adjudicationUrls.numberOfAdditionalDays.matchers.edit, numberOfAdditionalDaysEditRoute.view)
  post(adjudicationUrls.numberOfAdditionalDays.matchers.edit, numberOfAdditionalDaysEditRoute.submit)
  get(adjudicationUrls.numberOfAdditionalDays.matchers.manualEdit, numberOfAdditionalDaysManualEditRoute.view)
  post(adjudicationUrls.numberOfAdditionalDays.matchers.manualEdit, numberOfAdditionalDaysManualEditRoute.submit)

  return router
}
