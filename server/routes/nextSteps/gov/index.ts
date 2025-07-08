import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import NextStepsGovRoutes from './nextStepsGov'

export default function nextStepsGovRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const nextStepGovRoute = new NextStepsGovRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.nextStepsGov.matchers.start, nextStepGovRoute.view)
  post(adjudicationUrls.nextStepsGov.matchers.start, nextStepGovRoute.submit)

  return router
}
