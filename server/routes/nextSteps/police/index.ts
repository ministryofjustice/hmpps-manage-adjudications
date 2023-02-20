import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'
import NextStepsPoliceRoutes from './nextStepsPolice'

export default function nextStepsPoliceRoutes({
  userService,
  outcomesService,
}: {
  userService: UserService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const nextStepPoliceRoute = new NextStepsPoliceRoutes(userService, outcomesService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.nextStepsPolice.matchers.start, nextStepPoliceRoute.view)
  post(adjudicationUrls.nextStepsPolice.matchers.start, nextStepPoliceRoute.submit)

  return router
}
