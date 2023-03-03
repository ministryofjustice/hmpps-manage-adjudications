import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import DamagesOwedRoutes from './damagesOwed'

export default function damagesOwedRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const damagesOwedRoute = new DamagesOwedRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.moneyRecoveredForDamages.matchers.start, damagesOwedRoute.view)
  post(adjudicationUrls.moneyRecoveredForDamages.matchers.start, damagesOwedRoute.submit)

  return router
}
