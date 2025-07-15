import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import NextStepsInadRoutes from './nextStepsInad'

export default function nextStepsInadRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const nextStepInadRoute = new NextStepsInadRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.nextStepsInad.matchers.start, nextStepInadRoute.view)
  post(adjudicationUrls.nextStepsInad.matchers.start, nextStepInadRoute.submit)

  return router
}
