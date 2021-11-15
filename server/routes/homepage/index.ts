import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import HomepageRoutes from './homepage'
import UserService from '../../services/userService'

export default function homepageRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const prisonerSearch = new HomepageRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  get('/place-a-prisoner-on-report', prisonerSearch.view)
  return router
}
