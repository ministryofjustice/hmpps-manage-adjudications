import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PunishmentRoute from './punishment'
import PunishmentEditRoute from './punishmentEdit'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function PunishmentsAndDamagesRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const punishmenttRoute = new PunishmentRoute(userService)
  const punishmentEditRoute = new PunishmentEditRoute(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishment.matchers.start, punishmenttRoute.view)
  post(adjudicationUrls.punishment.matchers.start, punishmenttRoute.submit)
  get(adjudicationUrls.punishment.matchers.edit, punishmentEditRoute.view)
  post(adjudicationUrls.punishment.matchers.edit, punishmentEditRoute.submit)

  return router
}
