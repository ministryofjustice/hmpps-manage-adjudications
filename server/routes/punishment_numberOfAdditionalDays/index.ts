import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import NumberOfAdditionalDaysRoute from './numberOfAdditionalDays'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'

export default function NumberOfAdditionalDaysRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const numberOfAdditionalDaysRoute = new NumberOfAdditionalDaysRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.numberOfAdditionalDays.matchers.start, numberOfAdditionalDaysRoute.view)
  post(adjudicationUrls.numberOfAdditionalDays.matchers.start, numberOfAdditionalDaysRoute.submit)

  return router
}
