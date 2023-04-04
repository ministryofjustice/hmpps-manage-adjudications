import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PunishmentScheduleRoute from './punishmentSchedule'
import PunishmentScheduleEditRoute from './punishmentScheduleEdit'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function PunishmentScheduledRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const punishmentScheduleRoute = new PunishmentScheduleRoute(userService)
  const punishmentScheduleEditRoute = new PunishmentScheduleEditRoute(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishmentSchedule.matchers.start, punishmentScheduleRoute.view)
  post(adjudicationUrls.punishmentSchedule.matchers.start, punishmentScheduleRoute.submit)
  get(adjudicationUrls.punishmentSchedule.matchers.edit, punishmentScheduleEditRoute.view)
  post(adjudicationUrls.punishmentSchedule.matchers.edit, punishmentScheduleEditRoute.submit)

  return router
}
